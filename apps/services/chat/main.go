// 夜宴聊天服务
//
// 接收 web 端的完整消息历史与宾客名单（{messages, guests}），按顺序让每位
// 宾客调用 DeepSeek（deepseek-v4-flash，关闭思考模式），把上游 SSE 中的
// delta.content 翻译成夜宴自己的事件流，交给 web 端逐段渲染。
//
// 事件格式（每行一条 data: JSON）：
//
//	{"type":"guest_start","guest":"steve-jobs"}
//	{"type":"delta","guest":"steve-jobs","text":"..."}
//	{"type":"guest_end","guest":"steve-jobs"}
//	{"type":"done"}
//	{"type":"error","code":"UPSTREAM_ERROR"}
package main

import (
	"bufio"
	"bytes"
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	defaultPort    = "9000"
	defaultModel   = "deepseek-v4-flash"
	defaultBaseURL = "https://api.deepseek.com"
	defaultTimeout = 180 * time.Second

	// 上下文上限：群聊时每位宾客都会收到同一份历史，60k 字符是成本和
	// 回答质量之间的折中；再长就应该另开一桌，而不是无限堆历史。
	maxMessages       = 200
	maxUserRunes      = 2000
	maxAssistantRunes = 20_000
	maxTotalRunes     = 60_000
	maxGuests         = 3

	defaultDailyBudgetChars = 5_000_000
	defaultMaxConcurrency   = 6
)

const (
	errInvalidMessage    = "INVALID_MESSAGE"
	errMessageTooLong    = "MESSAGE_TOO_LONG"
	errInvalidGuest      = "INVALID_GUEST"
	errUpstreamError     = "UPSTREAM_ERROR"
	errServiceDailyLimit = "SERVICE_DAILY_LIMIT"
	errServiceBusy       = "SERVICE_BUSY"
)

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
	Guest   string `json:"guest,omitempty"`
}

type chatRequest struct {
	Messages []chatMessage `json:"messages"`
	Guests   []string      `json:"guests"`
}

type streamEvent struct {
	Type  string `json:"type"`
	Guest string `json:"guest,omitempty"`
	Text  string `json:"text,omitempty"`
	Code  string `json:"code,omitempty"`
}

type config struct {
	apiKey           string
	model            string
	baseURL          string
	timeout          time.Duration
	dailyLimit       int
	dailyBudgetChars int64
	maxConcurrency   int
	stateFile        string
}

func envOr(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}

func loadConfig() config {
	timeout := defaultTimeout
	if seconds := os.Getenv("DEEPSEEK_TIMEOUT_SECONDS"); seconds != "" {
		if parsed, err := time.ParseDuration(seconds + "s"); err == nil {
			timeout = parsed
		}
	}
	return config{
		apiKey:           os.Getenv("DEEPSEEK_API_KEY"),
		model:            envOr("DEEPSEEK_MODEL", defaultModel),
		baseURL:          strings.TrimRight(envOr("DEEPSEEK_BASE_URL", defaultBaseURL), "/"),
		timeout:          timeout,
		dailyLimit:       envInt("DEEPSEEK_DAILY_LIMIT", 1000),
		dailyBudgetChars: envInt64("CHAT_DAILY_BUDGET_CHARS", defaultDailyBudgetChars),
		maxConcurrency:   envInt("CHAT_MAX_CONCURRENCY", defaultMaxConcurrency),
		stateFile:        envOr("CHAT_STATE_FILE", filepath.Join(os.TempDir(), "night-banquet-quota.json")),
	}
}

func envInt(name string, fallback int) int {
	if raw := os.Getenv(name); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			return parsed
		}
	}
	return fallback
}

func envInt64(name string, fallback int64) int64 {
	if raw := os.Getenv(name); raw != "" {
		if parsed, err := strconv.ParseInt(raw, 10, 64); err == nil && parsed > 0 {
			return parsed
		}
	}
	return fallback
}

// 全局并发闸门：即使有人换了 IP 和指纹，也不能同时把上游打满。
var (
	concurrencyOnce sync.Once
	concurrencySem  chan struct{}
)

func acquireConcurrency(max int) bool {
	concurrencyOnce.Do(func() {
		if max < 1 {
			max = 1
		}
		concurrencySem = make(chan struct{}, max)
	})
	select {
	case concurrencySem <- struct{}{}:
		return true
	default:
		return false
	}
}

func releaseConcurrency() {
	<-concurrencySem
}

func messageRunes(content string) int64 {
	return int64(len([]rune(content)))
}

func messagesRunes(messages []map[string]string) int64 {
	total := int64(0)
	for _, message := range messages {
		total += messageRunes(message["content"])
	}
	return total
}

// estimateRoundChars 是「最坏情况」的成本估算：每位宾客的系统提示词、
// 完整历史、前面宾客按 max_tokens 估算的发言，再加上自己的输出上限。
// 它只用于预算预留，宁高勿低；请求结束后会按实际字符数结算。
func estimateRoundChars(messages []chatMessage, table []*guestProfile) int64 {
	historyChars := int64(0)
	for _, message := range messages {
		historyChars += messageRunes(message.Content)
	}
	maxTokens := tokenLimit(len(table))
	outputEstimate := int64(maxTokens * 3)
	total := int64(0)
	for index, guest := range table {
		system := buildGuestSystemPrompt(guest, table)
		input := messageRunes(system) + historyChars + int64(index)*(outputEstimate+200) + int64(len(messages))*20
		total += input + outputEstimate
	}
	return total
}

// validateMessages 返回错误码与错误详情；仅校验结构，不记录消息内容。
func validateMessages(messages []chatMessage, table []*guestProfile) (string, error) {
	if len(messages) == 0 {
		return errInvalidMessage, errors.New("empty messages")
	}
	if len(messages) > maxMessages {
		return errInvalidMessage, fmt.Errorf("too many messages: %d", len(messages))
	}
	allowed := make(map[string]struct{}, len(table))
	for _, guest := range table {
		allowed[guest.ID] = struct{}{}
	}
	total := 0
	for _, message := range messages {
		runes := len([]rune(message.Content))
		switch message.Role {
		case "user":
			if message.Guest != "" {
				return errInvalidMessage, errors.New("user message must not carry guest")
			}
			if strings.TrimSpace(message.Content) == "" {
				return errInvalidMessage, errors.New("empty user content")
			}
			if runes > maxUserRunes {
				return errMessageTooLong, fmt.Errorf("user message too long: %d runes", runes)
			}
		case "assistant":
			if strings.TrimSpace(message.Content) == "" {
				return errInvalidMessage, errors.New("empty assistant content")
			}
			if message.Guest == "" {
				return errInvalidMessage, errors.New("assistant message missing guest")
			}
			if _, ok := allowed[message.Guest]; !ok {
				return errInvalidMessage, fmt.Errorf("guest not at table: %q", message.Guest)
			}
			if runes > maxAssistantRunes {
				return errMessageTooLong, fmt.Errorf("assistant message too long: %d runes", runes)
			}
		default:
			return errInvalidMessage, fmt.Errorf("invalid role: %q", message.Role)
		}
		total += runes
		if total > maxTotalRunes {
			return errMessageTooLong, errors.New("history too long")
		}
	}
	return "", nil
}

// tokenLimit 让圆桌发言短一点，避免三个人轮流写长报告。
func tokenLimit(guestCount int) int {
	if guestCount > 1 {
		return 900
	}
	return 1400
}

func openDeepSeek(ctx context.Context, cfg config, messages []map[string]string, maxTokens int) (*http.Response, error) {
	payload := map[string]any{
		"model":       cfg.model,
		"messages":    messages,
		"stream":      true,
		"thinking":    map[string]string{"type": "disabled"},
		"temperature": 0.8,
		"max_tokens":  maxTokens,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, cfg.baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+cfg.apiKey)
	req.Header.Set("Content-Type", "application/json")
	return http.DefaultClient.Do(req)
}

func writeError(w http.ResponseWriter, status int, code string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": code})
}

func writeStreamEvent(w http.ResponseWriter, flusher http.Flusher, event streamEvent) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	if _, err := fmt.Fprintf(w, "data: %s\n\n", data); err != nil {
		return err
	}
	if flusher != nil {
		flusher.Flush()
	}
	return nil
}

// streamDeepSeek 把一条上游 SSE 转成 delta 事件，并返回完整文本。
func streamDeepSeek(w http.ResponseWriter, flusher http.Flusher, response *http.Response, guestID string) (string, error) {
	var content strings.Builder
	scanner := bufio.NewScanner(response.Body)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)

	for scanner.Scan() {
		line := scanner.Text()
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if data == "" {
			continue
		}
		if data == "[DONE]" {
			break
		}
		var chunk struct {
			Choices []struct {
				Delta struct {
					Content string `json:"content"`
				} `json:"delta"`
			} `json:"choices"`
		}
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			log.Printf("skip malformed deepseek chunk: %v", err)
			continue
		}
		if len(chunk.Choices) == 0 {
			continue
		}
		delta := chunk.Choices[0].Delta.Content
		if delta == "" {
			continue
		}
		content.WriteString(delta)
		if err := writeStreamEvent(w, flusher, streamEvent{Type: "delta", Guest: guestID, Text: delta}); err != nil {
			return content.String(), err
		}
	}
	return content.String(), scanner.Err()
}

func handleStream(w http.ResponseWriter, r *http.Request) {
	cfg := loadConfig()
	if cfg.apiKey == "" {
		log.Print("DEEPSEEK_API_KEY is not set")
		writeError(w, http.StatusServiceUnavailable, errUpstreamError)
		return
	}

	var request chatRequest
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	if err := decoder.Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, errInvalidMessage)
		return
	}

	table, err := resolveGuests(request.Guests)
	if err != nil {
		log.Printf("invalid guest list: %v", err)
		writeError(w, http.StatusBadRequest, errInvalidGuest)
		return
	}
	if code, err := validateMessages(request.Messages, table); err != nil {
		log.Printf("invalid chat request: %v", err)
		status := http.StatusBadRequest
		if code == errMessageTooLong {
			status = http.StatusRequestEntityTooLarge
		}
		writeError(w, status, code)
		return
	}

	if !acquireConcurrency(cfg.maxConcurrency) {
		log.Print("chat concurrency limit reached")
		writeError(w, http.StatusTooManyRequests, errServiceBusy)
		return
	}
	defer releaseConcurrency()

	// 先按最坏情况占住全局预算；如果今天已经不够，直接在调用上游前拒绝。
	estimate := estimateRoundChars(request.Messages, table)
	if !quota.reserve(cfg.stateFile, estimate, cfg.dailyBudgetChars, cfg.dailyLimit) {
		log.Printf("daily chat budget exhausted: estimate=%d budget=%d", estimate, cfg.dailyBudgetChars)
		writeError(w, http.StatusTooManyRequests, errServiceDailyLimit)
		return
	}
	actualChars := int64(0)
	defer func() {
		quota.settle(estimate, actualChars)
	}()

	ctx, cancel := context.WithTimeout(r.Context(), cfg.timeout)
	defer cancel()

	// 第一位宾客的上游连接先建立：如果 DeepSeek 一开始就失败，还能返回普通
	// JSON 错误，而不是一个已经开始的 SSE 流。
	first := table[0]
	firstMessages := buildGuestMessages(first, table, request.Messages, nil)
	actualChars += messagesRunes(firstMessages)
	firstResponse, err := openDeepSeek(ctx, cfg, firstMessages, tokenLimit(len(table)))
	if err != nil {
		log.Printf("deepseek request failed: %v", err)
		writeError(w, http.StatusBadGateway, errUpstreamError)
		return
	}
	defer firstResponse.Body.Close()
	if firstResponse.StatusCode != http.StatusOK {
		detail, _ := io.ReadAll(io.LimitReader(firstResponse.Body, 4096))
		log.Printf("deepseek returned %d: %s", firstResponse.StatusCode, strings.TrimSpace(string(detail)))
		writeError(w, http.StatusBadGateway, errUpstreamError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	flusher, _ := w.(http.Flusher)
	generated := make([]chatMessage, 0, len(table))

	for index, profile := range table {
		response := firstResponse
		if index > 0 {
			guestMessages := buildGuestMessages(profile, table, request.Messages, generated)
			actualChars += messagesRunes(guestMessages)
			response, err = openDeepSeek(ctx, cfg, guestMessages, tokenLimit(len(table)))
			if err != nil {
				log.Printf("deepseek request failed for %s: %v", profile.ID, err)
				_ = writeStreamEvent(w, flusher, streamEvent{Type: "error", Code: errUpstreamError})
				return
			}
			defer response.Body.Close()
			if response.StatusCode != http.StatusOK {
				detail, _ := io.ReadAll(io.LimitReader(response.Body, 4096))
				log.Printf("deepseek returned %d for %s: %s", response.StatusCode, profile.ID, strings.TrimSpace(string(detail)))
				_ = writeStreamEvent(w, flusher, streamEvent{Type: "error", Code: errUpstreamError})
				return
			}
		}

		if err := writeStreamEvent(w, flusher, streamEvent{Type: "guest_start", Guest: profile.ID}); err != nil {
			return
		}
		content, streamErr := streamDeepSeek(w, flusher, response, profile.ID)
		actualChars += messageRunes(content)
		if streamErr != nil {
			if !errors.Is(streamErr, context.Canceled) {
				log.Printf("read deepseek stream for %s: %v", profile.ID, streamErr)
			}
			_ = writeStreamEvent(w, flusher, streamEvent{Type: "error", Code: errUpstreamError})
			return
		}
		if strings.TrimSpace(content) != "" {
			generated = append(generated, chatMessage{Role: "assistant", Content: content, Guest: profile.ID})
		}
		if err := writeStreamEvent(w, flusher, streamEvent{Type: "guest_end", Guest: profile.ID}); err != nil {
			return
		}
	}

	_ = writeStreamEvent(w, flusher, streamEvent{Type: "done"})
}

func healthz(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	state := quota.snapshot()
	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok": true,
		"quota": map[string]any{
			"date":       state.Date,
			"spentChars": state.SpentChars,
			"requests":   state.Requests,
		},
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", healthz)
	mux.HandleFunc("POST /api/v1/chat/stream", handleStream)

	cfg := loadConfig()
	quota.load(cfg.stateFile)
	port := envOr("PORT", defaultPort)
	log.Printf(
		"夜宴聊天服务 listening on :%s (budget=%d chars/day, concurrency=%d)",
		port,
		cfg.dailyBudgetChars,
		cfg.maxConcurrency,
	)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
