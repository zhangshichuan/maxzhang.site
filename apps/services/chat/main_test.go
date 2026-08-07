package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
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

func TestStreamRequiresAPIKey(t *testing.T) {
	t.Setenv("DEEPSEEK_API_KEY", "")
	recorder := postStream(t, newTestMux(), `{"messages":[{"role":"user","content":"hi"}]}`)
	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusServiceUnavailable)
	}
}

func TestStreamRejectsInvalidRequests(t *testing.T) {
	t.Setenv("DEEPSEEK_API_KEY", "test-key")
	cases := []struct {
		name       string
		body       string
		wantStatus int
		wantCode   string
	}{
		{"empty body", ``, http.StatusBadRequest, errInvalidMessage},
		{"empty messages", `{"messages":[]}`, http.StatusBadRequest, errInvalidMessage},
		{"invalid role", `{"messages":[{"role":"system","content":"hi"}]}`, http.StatusBadRequest, errInvalidMessage},
		{"empty content", `{"messages":[{"role":"user","content":"  "}]}`, http.StatusBadRequest, errInvalidMessage},
		{
			"user too long",
			fmt.Sprintf(`{"messages":[{"role":"user","content":%q}]}`, strings.Repeat("长", maxUserRunes+1)),
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

	recorder := postStream(t, newTestMux(), `{"messages":[{"role":"user","content":"看看运势"}]}`)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	if contentType := recorder.Header().Get("Content-Type"); !strings.HasPrefix(contentType, "text/event-stream") {
		t.Fatalf("content-type = %q", contentType)
	}
	if got, want := recorder.Body.String(), "data: 你好\ndata: ，施主\n"; got != want {
		t.Fatalf("body = %q, want %q", got, want)
	}
	if gotAuthorization != "Bearer test-key" {
		t.Fatalf("authorization = %q", gotAuthorization)
	}
	if gotPayload["model"] != defaultModel {
		t.Fatalf("model = %v, want %s", gotPayload["model"], defaultModel)
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
	if !ok || system["role"] != "system" || !strings.Contains(system["content"].(string), "清风仙人") {
		t.Fatalf("system message = %v", messages[0])
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

	recorder := postStream(t, newTestMux(), `{"messages":[{"role":"user","content":"hi"}]}`)
	if got, want := recorder.Body.String(), "data: ok\n"; got != want {
		t.Fatalf("body = %q, want %q", got, want)
	}
}

func TestStreamReturnsBadGatewayOnUpstreamError(t *testing.T) {
	t.Setenv("DEEPSEEK_API_KEY", "test-key")
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "boom", http.StatusInternalServerError)
	}))
	defer upstream.Close()
	t.Setenv("DEEPSEEK_BASE_URL", upstream.URL)

	recorder := postStream(t, newTestMux(), `{"messages":[{"role":"user","content":"hi"}]}`)
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusBadGateway)
	}
}
