package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"sync"
	"testing"
)

func newTestMux() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/v1/chat/stream", handleStream)
	return mux
}

func postStream(t *testing.T, handler http.Handler, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/chat/stream", strings.NewReader(body))
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, req)
	return recorder
}

func requestBody(guests []string, messages ...chatMessage) string {
	body, _ := json.Marshal(chatRequest{Messages: messages, Guests: guests})
	return string(body)
}

func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "night-banquet-test-*")
	if err != nil {
		panic(err)
	}
	_ = os.Setenv("CHAT_STATE_FILE", filepath.Join(dir, "quota.json"))
	_ = os.Setenv("CHAT_DAILY_BUDGET_CHARS", "5000000")
	code := m.Run()
	_ = os.RemoveAll(dir)
	os.Exit(code)
}

func parseEvents(t *testing.T, body string) []streamEvent {
	t.Helper()
	events := make([]streamEvent, 0)
	for _, line := range strings.Split(body, "\n") {
		line = strings.TrimSpace(line)
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		payload := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if payload == "" {
			continue
		}
		var event streamEvent
		if err := json.Unmarshal([]byte(payload), &event); err != nil {
			t.Fatalf("invalid event %q: %v", payload, err)
		}
		events = append(events, event)
	}
	return events
}

func TestHealthz(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	recorder := httptest.NewRecorder()
	healthz(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("healthz status = %d, want %d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"ok":true`) {
		t.Fatalf("healthz body = %q", recorder.Body.String())
	}
}

func TestPersonasLoaded(t *testing.T) {
	for _, id := range guestOrder {
		profile, ok := guestProfiles[id]
		if !ok {
			t.Fatalf("guest %q is not registered", id)
		}
		if profile.NameZh == "" || profile.NameEn == "" {
			t.Fatalf("guest %q has no name", id)
		}
		if strings.TrimSpace(profile.Prompt) == "" {
			t.Fatalf("guest %q has an empty prompt", id)
		}
		if !strings.HasPrefix(profile.Prompt, "# ") {
			t.Fatalf("guest %q prompt should start with a title", id)
		}
	}
}

func TestStreamRequiresAPIKey(t *testing.T) {
	t.Setenv("DEEPSEEK_API_KEY", "")
	recorder := postStream(t, newTestMux(), requestBody([]string{"charlie-munger"}, chatMessage{Role: "user", Content: "hi"}))
	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusServiceUnavailable)
	}
}

func TestStreamRejectsInvalidRequests(t *testing.T) {
	t.Setenv("DEEPSEEK_API_KEY", "test-key")
	validUser := chatMessage{Role: "user", Content: "hi"}
	cases := []struct {
		name       string
		body       string
		wantStatus int
		wantCode   string
	}{
		{"empty body", ``, http.StatusBadRequest, errInvalidMessage},
		{"missing guests", requestBody(nil, validUser), http.StatusBadRequest, errInvalidGuest},
		{"unknown guest", requestBody([]string{"nobody"}, validUser), http.StatusBadRequest, errInvalidGuest},
		{
			"too many guests",
			requestBody([]string{"charlie-munger", "steve-jobs", "richard-feynman", "elon-musk"}, validUser),
			http.StatusBadRequest,
			errInvalidGuest,
		},
		{"duplicate guest", requestBody([]string{"charlie-munger", "charlie-munger"}, validUser), http.StatusBadRequest, errInvalidGuest},
		{"empty messages", requestBody([]string{"charlie-munger"}), http.StatusBadRequest, errInvalidMessage},
		{"invalid role", requestBody([]string{"charlie-munger"}, chatMessage{Role: "system", Content: "hi"}), http.StatusBadRequest, errInvalidMessage},
		{"empty content", requestBody([]string{"charlie-munger"}, chatMessage{Role: "user", Content: "  "}), http.StatusBadRequest, errInvalidMessage},
		{
			"assistant missing guest",
			requestBody([]string{"charlie-munger"}, chatMessage{Role: "assistant", Content: "hi"}),
			http.StatusBadRequest,
			errInvalidMessage,
		},
		{
			"assistant guest not at table",
			requestBody([]string{"charlie-munger"}, chatMessage{Role: "assistant", Content: "hi", Guest: "steve-jobs"}),
			http.StatusBadRequest,
			errInvalidMessage,
		},
		{
			"user carries guest",
			requestBody([]string{"charlie-munger"}, chatMessage{Role: "user", Content: "hi", Guest: "charlie-munger"}),
			http.StatusBadRequest,
			errInvalidMessage,
		},
		{
			"user too long",
			requestBody([]string{"charlie-munger"}, chatMessage{Role: "user", Content: strings.Repeat("长", maxUserRunes+1)}),
			http.StatusRequestEntityTooLarge,
			errMessageTooLong,
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			recorder := postStream(t, newTestMux(), tc.body)
			if recorder.Code != tc.wantStatus {
				t.Fatalf("status = %d, want %d", recorder.Code, tc.wantStatus)
			}
			var payload map[string]string
			_ = json.Unmarshal(recorder.Body.Bytes(), &payload)
			if payload["error"] != tc.wantCode {
				t.Fatalf("error = %q, want %q", payload["error"], tc.wantCode)
			}
		})
	}
}

func TestStreamProxiesDeepSeek(t *testing.T) {
	t.Setenv("DEEPSEEK_API_KEY", "test-key")

	var gotAuthorization string
	var gotPayload map[string]any
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotAuthorization = r.Header.Get("Authorization")
		_ = json.NewDecoder(r.Body).Decode(&gotPayload)
		w.Header().Set("Content-Type", "text/event-stream")
		_, _ = fmt.Fprint(w, "data: {\"choices\":[{\"delta\":{\"content\":\"你好\"}}]}\n\ndata: {\"choices\":[{\"delta\":{\"content\":\"，施主\"}}]}\n\ndata: [DONE]\n")
	}))
	defer upstream.Close()
	t.Setenv("DEEPSEEK_BASE_URL", upstream.URL)

	recorder := postStream(
		t,
		newTestMux(),
		requestBody([]string{"charlie-munger"}, chatMessage{Role: "user", Content: "看看运势"}),
	)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	if contentType := recorder.Header().Get("Content-Type"); !strings.HasPrefix(contentType, "text/event-stream") {
		t.Fatalf("content-type = %q", contentType)
	}

	events := parseEvents(t, recorder.Body.String())
	wantEvents := []streamEvent{
		{Type: "guest_start", Guest: "charlie-munger"},
		{Type: "delta", Guest: "charlie-munger", Text: "你好"},
		{Type: "delta", Guest: "charlie-munger", Text: "，施主"},
		{Type: "guest_end", Guest: "charlie-munger"},
		{Type: "done"},
	}
	if !reflect.DeepEqual(events, wantEvents) {
		t.Fatalf("events = %+v, want %+v", events, wantEvents)
	}

	if gotAuthorization != "Bearer test-key" {
		t.Fatalf("authorization = %q", gotAuthorization)
	}
	if gotPayload["model"] != defaultModel {
		t.Fatalf("model = %v, want %s", gotPayload["model"], defaultModel)
	}
	if gotPayload["temperature"] != 0.8 {
		t.Fatalf("temperature = %v, want 0.8", gotPayload["temperature"])
	}
	if gotPayload["max_tokens"] != float64(1400) {
		t.Fatalf("max_tokens = %v, want 1400", gotPayload["max_tokens"])
	}
	thinking, ok := gotPayload["thinking"].(map[string]any)
	if !ok || thinking["type"] != "disabled" {
		t.Fatalf("thinking = %v, want disabled", gotPayload["thinking"])
	}
	messages, ok := gotPayload["messages"].([]any)
	if !ok || len(messages) != 2 {
		t.Fatalf("messages = %v", gotPayload["messages"])
	}
	system, ok := messages[0].(map[string]any)
	if !ok || system["role"] != "system" || !strings.Contains(system["content"].(string), "查理·芒格") {
		t.Fatalf("system message = %v", messages[0])
	}
	if !strings.Contains(system["content"].(string), "夜宴") {
		t.Fatalf("system message should contain the banquet rules")
	}
}

func TestStreamGroupChatOrchestratesGuests(t *testing.T) {
	t.Setenv("DEEPSEEK_API_KEY", "test-key")

	var mu sync.Mutex
	var payloads []map[string]any
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload map[string]any
		_ = json.NewDecoder(r.Body).Decode(&payload)
		mu.Lock()
		payloads = append(payloads, payload)
		index := len(payloads) - 1
		mu.Unlock()

		content := "先反过来想。"
		if index == 1 {
			content = "我补充一句。"
		}
		w.Header().Set("Content-Type", "text/event-stream")
		body, _ := json.Marshal(map[string]any{
			"choices": []any{map[string]any{"delta": map[string]string{"content": content}}},
		})
		_, _ = fmt.Fprintf(w, "data: %s\n\ndata: [DONE]\n", body)
	}))
	defer upstream.Close()
	t.Setenv("DEEPSEEK_BASE_URL", upstream.URL)

	recorder := postStream(
		t,
		newTestMux(),
		requestBody(
			[]string{"charlie-munger", "steve-jobs"},
			chatMessage{Role: "user", Content: "这个决定靠谱吗？"},
		),
	)
	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	mu.Lock()
	defer mu.Unlock()
	if len(payloads) != 2 {
		t.Fatalf("upstream calls = %d, want 2", len(payloads))
	}
	firstSystem := systemPrompt(t, payloads[0])
	if !strings.Contains(firstSystem, "查理·芒格") || !strings.Contains(firstSystem, "史蒂夫·乔布斯") {
		t.Fatalf("first system prompt should mention both guests: %s", firstSystem)
	}
	secondSystem := systemPrompt(t, payloads[1])
	if !strings.Contains(secondSystem, "史蒂夫·乔布斯") || !strings.Contains(secondSystem, "查理·芒格") {
		t.Fatalf("second system prompt should mention both guests: %s", secondSystem)
	}
	secondMessages := messagesOf(t, payloads[1])
	foundMungerTurn := false
	for _, message := range secondMessages {
		if message["role"] == "user" && message["content"] == "【查理·芒格】先反过来想。" {
			foundMungerTurn = true
		}
	}
	if !foundMungerTurn {
		t.Fatalf("second guest should see the first guest's turn: %v", secondMessages)
	}

	events := parseEvents(t, recorder.Body.String())
	wantEvents := []streamEvent{
		{Type: "guest_start", Guest: "charlie-munger"},
		{Type: "delta", Guest: "charlie-munger", Text: "先反过来想。"},
		{Type: "guest_end", Guest: "charlie-munger"},
		{Type: "guest_start", Guest: "steve-jobs"},
		{Type: "delta", Guest: "steve-jobs", Text: "我补充一句。"},
		{Type: "guest_end", Guest: "steve-jobs"},
		{Type: "done"},
	}
	if !reflect.DeepEqual(events, wantEvents) {
		t.Fatalf("events = %+v, want %+v", events, wantEvents)
	}
}

func TestStreamSkipsMalformedChunks(t *testing.T) {
	t.Setenv("DEEPSEEK_API_KEY", "test-key")
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		_, _ = fmt.Fprint(w, "data: not-json\n\ndata: {\"choices\":[{\"delta\":{\"content\":\"ok\"}}]}\n")
	}))
	defer upstream.Close()
	t.Setenv("DEEPSEEK_BASE_URL", upstream.URL)

	recorder := postStream(t, newTestMux(), requestBody([]string{"charlie-munger"}, chatMessage{Role: "user", Content: "hi"}))
	events := parseEvents(t, recorder.Body.String())
	wantEvents := []streamEvent{
		{Type: "guest_start", Guest: "charlie-munger"},
		{Type: "delta", Guest: "charlie-munger", Text: "ok"},
		{Type: "guest_end", Guest: "charlie-munger"},
		{Type: "done"},
	}
	if !reflect.DeepEqual(events, wantEvents) {
		t.Fatalf("events = %+v, want %+v", events, wantEvents)
	}
}

func TestStreamReturnsBadGatewayOnUpstreamError(t *testing.T) {
	t.Setenv("DEEPSEEK_API_KEY", "test-key")
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "boom", http.StatusInternalServerError)
	}))
	defer upstream.Close()
	t.Setenv("DEEPSEEK_BASE_URL", upstream.URL)

	recorder := postStream(t, newTestMux(), requestBody([]string{"charlie-munger"}, chatMessage{Role: "user", Content: "hi"}))
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusBadGateway)
	}
}

func TestStreamEnforcesDailyServiceLimit(t *testing.T) {
	resetQuotaStateForTest()
	t.Setenv("DEEPSEEK_API_KEY", "test-key")
	t.Setenv("DEEPSEEK_DAILY_LIMIT", "3")
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		_, _ = fmt.Fprint(w, "data: {\"choices\":[{\"delta\":{\"content\":\"ok\"}}]}\n")
	}))
	defer upstream.Close()
	t.Setenv("DEEPSEEK_BASE_URL", upstream.URL)

	mux := newTestMux()
	body := requestBody([]string{"charlie-munger"}, chatMessage{Role: "user", Content: "hi"})
	for index := 0; index < 3; index += 1 {
		recorder := postStream(t, mux, body)
		if recorder.Code != http.StatusOK {
			t.Fatalf("request %d status = %d, want %d", index+1, recorder.Code, http.StatusOK)
		}
	}

	recorder := postStream(t, mux, body)
	if recorder.Code != http.StatusTooManyRequests {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusTooManyRequests)
	}
	var payload map[string]string
	_ = json.Unmarshal(recorder.Body.Bytes(), &payload)
	if payload["error"] != errServiceDailyLimit {
		t.Fatalf("error = %q, want %q", payload["error"], errServiceDailyLimit)
	}
	resetQuotaStateForTest()
}

func TestBuildGuestMessages(t *testing.T) {
	table, err := resolveGuests([]string{"charlie-munger", "steve-jobs"})
	if err != nil {
		t.Fatalf("resolveGuests: %v", err)
	}
	history := []chatMessage{
		{Role: "user", Content: "问题"},
		{Role: "assistant", Content: "芒格说", Guest: "charlie-munger"},
		{Role: "assistant", Content: "乔布斯说", Guest: "steve-jobs"},
	}
	generated := []chatMessage{
		{Role: "assistant", Content: "本轮芒格补充", Guest: "charlie-munger"},
	}
	messages := buildGuestMessages(table[1], table, history, generated)
	want := []map[string]string{
		{"role": "system", "content": messages[0]["content"]},
		{"role": "user", "content": "问题"},
		{"role": "user", "content": "【查理·芒格】芒格说"},
		{"role": "assistant", "content": "乔布斯说"},
		{"role": "user", "content": "【查理·芒格】本轮芒格补充"},
	}
	if !reflect.DeepEqual(messages, want) {
		t.Fatalf("messages = %#v, want %#v", messages, want)
	}
	if !strings.Contains(messages[0]["content"], "桌上还有：查理·芒格") {
		t.Fatalf("jobs prompt should list the other guest: %s", messages[0]["content"])
	}

	soloTable, _ := resolveGuests([]string{"richard-feynman"})
	soloMessages := buildGuestMessages(soloTable[0], soloTable, []chatMessage{{Role: "user", Content: "讲清楚"}}, nil)
	if !strings.Contains(soloMessages[0]["content"], "只有你和用户两个人") {
		t.Fatalf("solo prompt should say the table has two people: %s", soloMessages[0]["content"])
	}
}

func systemPrompt(t *testing.T, payload map[string]any) string {
	t.Helper()
	messages := messagesOf(t, payload)
	if len(messages) == 0 {
		t.Fatal("no messages in payload")
	}
	if messages[0]["role"] != "system" {
		t.Fatalf("first message is not system: %v", messages[0])
	}
	return messages[0]["content"]
}

func messagesOf(t *testing.T, payload map[string]any) []map[string]string {
	t.Helper()
	raw, ok := payload["messages"].([]any)
	if !ok {
		t.Fatalf("messages = %v", payload["messages"])
	}
	out := make([]map[string]string, 0, len(raw))
	for _, item := range raw {
		message, ok := item.(map[string]any)
		if !ok {
			t.Fatalf("message = %v", item)
		}
		role, _ := message["role"].(string)
		content, _ := message["content"].(string)
		out = append(out, map[string]string{"role": role, "content": content})
	}
	return out
}

func TestStreamRejectsWhenBudgetExhausted(t *testing.T) {
	resetQuotaStateForTest()
	t.Setenv("DEEPSEEK_API_KEY", "test-key")
	t.Setenv("CHAT_DAILY_BUDGET_CHARS", "1000")
	upstreamCalls := 0
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		upstreamCalls++
		w.Header().Set("Content-Type", "text/event-stream")
		_, _ = fmt.Fprint(w, "data: {\"choices\":[{\"delta\":{\"content\":\"ok\"}}]}\n")
	}))
	defer upstream.Close()
	t.Setenv("DEEPSEEK_BASE_URL", upstream.URL)

	recorder := postStream(t, newTestMux(), requestBody([]string{"charlie-munger"}, chatMessage{Role: "user", Content: "hi"}))
	if recorder.Code != http.StatusTooManyRequests {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusTooManyRequests)
	}
	var payload map[string]string
	_ = json.Unmarshal(recorder.Body.Bytes(), &payload)
	if payload["error"] != errServiceDailyLimit {
		t.Fatalf("error = %q, want %q", payload["error"], errServiceDailyLimit)
	}
	if upstreamCalls != 0 {
		t.Fatalf("upstream calls = %d, want 0", upstreamCalls)
	}
}

func TestEstimateRoundChars(t *testing.T) {
	single, err := resolveGuests([]string{"charlie-munger"})
	if err != nil {
		t.Fatalf("resolveGuests: %v", err)
	}
	group, err := resolveGuests([]string{"charlie-munger", "steve-jobs", "richard-feynman"})
	if err != nil {
		t.Fatalf("resolveGuests: %v", err)
	}
	shortHistory := []chatMessage{{Role: "user", Content: "短问题"}}
	longHistory := []chatMessage{{Role: "user", Content: strings.Repeat("长", 20_000)}}

	singleShort := estimateRoundChars(shortHistory, single)
	groupShort := estimateRoundChars(shortHistory, group)
	singleLong := estimateRoundChars(longHistory, single)
	if groupShort <= singleShort {
		t.Fatalf("group estimate %d should exceed single estimate %d", groupShort, singleShort)
	}
	if singleLong <= singleShort {
		t.Fatalf("long history estimate %d should exceed short estimate %d", singleLong, singleShort)
	}
}
