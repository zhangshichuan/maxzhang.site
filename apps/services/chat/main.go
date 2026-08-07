// 算卦聊天服务
//
// 接收 web 端完整消息历史（{messages: [{role, content}]}），调用 DeepSeek
// Chat Completions（deepseek-v4-flash，关闭思考模式），把上游 SSE 中的
// delta.content 翻译成纯文本 "data: <内容>" 行，流式返回给 web 端。
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
	"strconv"
	"strings"
	"sync"
	"time"
)

//go:embed prompt.md
var systemPrompt string

const (
	defaultPort    = "9000"
	defaultModel   = "deepseek-v4-flash"
	defaultBaseURL = "https://api.deepseek.com"
	defaultTimeout = 120 * time.Second

	maxMessages       = 200 // 100 轮（user + assistant 各一条）
	maxUserRunes      = 2000
	maxAssistantRunes = 50000
	maxTotalRunes     = 200_000
)

const (
	errInvalidMessage    = "INVALID_MESSAGE"
	errMessageTooLong    = "MESSAGE_TOO_LONG"
	errUpstreamError     = "UPSTREAM_ERROR"
	errServiceDailyLimit = "SERVICE_DAILY_LIMIT"
)

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Messages []chatMessage `json:"messages"`
}

type config struct {
	apiKey     string
	model      string
	baseURL    string
	timeout    time.Duration
	dailyLimit int
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
		apiKey:     os.Getenv("DEEPSEEK_API_KEY"),
		model:      envOr("DEEPSEEK_MODEL", defaultModel),
		baseURL:    strings.TrimRight(envOr("DEEPSEEK_BASE_URL", defaultBaseURL), "/"),
		timeout:    timeout,
		dailyLimit: envInt("DEEPSEEK_DAILY_LIMIT", 1000),
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

// 服务每日总对话上限：跨指纹、跨 IP 的全局兜底，防止单日成本失控
var (
	dailyLimitMu    sync.Mutex
	dailyLimitDate  string
	dailyLimitCount int
)

func acquireDailySlot(limit int) bool {
	dailyLimitMu.Lock()
	defer dailyLimitMu.Unlock()

	today := time.Now().Format("2006-01-02")
	if dailyLimitDate != today {
		dailyLimitDate = today
		dailyLimitCount = 0
	}
	if dailyLimitCount >= limit {
		return false
	}
	dailyLimitCount++
	return true
}

// validateMessages 返回错误码与错误详情；仅校验结构，不记录消息内容。
func validateMessages(messages []chatMessage) (string, error) {
	if len(messages) == 0 {
		return errInvalidMessage, errors.New("empty messages")
	}
	if len(messages) > maxMessages {
		return errInvalidMessage, fmt.Errorf("too many messages: %d", len(messages))
	}
	total := 0
	for _, message := range messages {
		runes := len([]rune(message.Content))
		switch message.Role {
		case "user":
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

func buildDeepSeekRequest(ctx context.Context, cfg config, messages []chatMessage) (*http.Request, error) {
	deepseekMessages := make([]map[string]string, 0, len(messages)+1)
	deepseekMessages = append(deepseekMessages, map[string]string{"role": "system", "content": systemPrompt})
	for _, message := range messages {
		deepseekMessages = append(deepseekMessages, map[string]string{"role": message.Role, "content": message.Content})
	}
	payload := map[string]any{
		"model":    cfg.model,
		"messages": deepseekMessages,
		"stream":   true,
		"thinking": map[string]string{"type": "disabled"},
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
	return req, nil
}

func writeError(w http.ResponseWriter, status int, code string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": code})
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
	if code, err := validateMessages(request.Messages); err != nil {
		log.Printf("invalid chat request: %v", err)
		status := http.StatusBadRequest
		if code == errMessageTooLong {
			status = http.StatusRequestEntityTooLarge
		}
		writeError(w, status, code)
		return
	}

	if !acquireDailySlot(cfg.dailyLimit) {
		log.Print("daily service limit reached")
		writeError(w, http.StatusTooManyRequests, errServiceDailyLimit)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), cfg.timeout)
	defer cancel()

	upstreamRequest, err := buildDeepSeekRequest(ctx, cfg, request.Messages)
	if err != nil {
		log.Printf("build deepseek request: %v", err)
		writeError(w, http.StatusBadGateway, errUpstreamError)
		return
	}

	response, err := http.DefaultClient.Do(upstreamRequest)
	if err != nil {
		log.Printf("deepseek request failed: %v", err)
		writeError(w, http.StatusBadGateway, errUpstreamError)
		return
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		detail, _ := io.ReadAll(io.LimitReader(response.Body, 4096))
		log.Printf("deepseek returned %d: %s", response.StatusCode, strings.TrimSpace(string(detail)))
		writeError(w, http.StatusBadGateway, errUpstreamError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	flusher, _ := w.(http.Flusher)
	scanner := bufio.NewScanner(response.Body)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)

	for scanner.Scan() {
		select {
		case <-r.Context().Done():
			return
		default:
		}
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
		content := chunk.Choices[0].Delta.Content
		if content == "" {
			continue
		}
		if _, err := fmt.Fprintf(w, "data: %s\n", content); err != nil {
			return
		}
		if flusher != nil {
			flusher.Flush()
		}
	}
	if err := scanner.Err(); err != nil && !errors.Is(err, context.Canceled) {
		log.Printf("read deepseek stream: %v", err)
	}
}

func healthz(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(map[string]bool{"ok": true})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", healthz)
	mux.HandleFunc("POST /api/v1/chat/stream", handleStream)

	port := envOr("PORT", defaultPort)
	log.Printf("算卦聊天服务 listening on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
