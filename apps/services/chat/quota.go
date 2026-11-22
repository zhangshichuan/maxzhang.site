package main

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// quotaState 是夜宴的全局预算状态，用来兜住整站额度的硬上限。
//
// 它按「估算字符数」记账，而不是只数请求：群聊一轮会调用多次模型，
// 长上下文也比短问题贵得多。估算值在请求开始前预留，结束后按实际
// 用量结算；即使进程重启，也会从 CHAT_STATE_FILE 恢复当天的累计值。
type quotaState struct {
	Date       string `json:"date"`
	SpentChars int64  `json:"spentChars"`
	Requests   int    `json:"requests"`
}

type quotaStore struct {
	mu     sync.Mutex
	loaded bool
	path   string
	state  quotaState
}

var quota = &quotaStore{}

func todayKey() string {
	return time.Now().Format("2006-01-02")
}

func (q *quotaStore) ensureLoadedLocked(path string) {
	if q.loaded && q.path == path {
		return
	}
	q.loaded = true
	q.path = path
	q.state = quotaState{Date: todayKey()}
	if path == "" {
		return
	}
	data, err := os.ReadFile(path)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("read quota state: %v", err)
		}
		return
	}
	var state quotaState
	if err := json.Unmarshal(data, &state); err != nil {
		log.Printf("ignore malformed quota state: %v", err)
		return
	}
	if state.Date == todayKey() {
		q.state = state
	}
}

// reserve 先按估算值占住预算；返回 false 表示今天的额度已经不够了。
func (q *quotaStore) reserve(path string, estimate, charBudget int64, requestLimit int) bool {
	q.mu.Lock()
	defer q.mu.Unlock()

	q.ensureLoadedLocked(path)
	if q.state.Date != todayKey() {
		q.state = quotaState{Date: todayKey()}
	}
	if requestLimit > 0 && q.state.Requests >= requestLimit {
		return false
	}
	if charBudget > 0 && q.state.SpentChars+estimate > charBudget {
		return false
	}
	q.state.Requests++
	q.state.SpentChars += estimate
	q.persistLocked()
	return true
}

// settle 把「预留的估算值」换成「实际估算用量」，多退少补。
func (q *quotaStore) settle(estimate, actual int64) {
	q.mu.Lock()
	defer q.mu.Unlock()

	if q.state.Date != todayKey() {
		q.state = quotaState{Date: todayKey()}
	}
	q.state.SpentChars -= estimate
	if q.state.SpentChars < 0 {
		q.state.SpentChars = 0
	}
	if actual > 0 {
		q.state.SpentChars += actual
	}
	q.persistLocked()
}

func (q *quotaStore) load(path string) {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.ensureLoadedLocked(path)
}

func (q *quotaStore) snapshot() quotaState {
	q.mu.Lock()
	defer q.mu.Unlock()
	return q.state
}

func (q *quotaStore) persistLocked() {
	if q.path == "" {
		return
	}
	data, err := json.Marshal(q.state)
	if err != nil {
		log.Printf("marshal quota state: %v", err)
		return
	}
	dir := filepath.Dir(q.path)
	if dir != "." {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			log.Printf("create quota dir: %v", err)
			return
		}
	}
	tmp := q.path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o600); err != nil {
		log.Printf("write quota state: %v", err)
		return
	}
	if err := os.Rename(tmp, q.path); err != nil {
		log.Printf("replace quota state: %v", err)
	}
}

// resetQuotaStateForTest 只给测试用：清空内存状态并删掉状态文件。
func resetQuotaStateForTest() {
	quota.mu.Lock()
	defer quota.mu.Unlock()
	if quota.path != "" {
		_ = os.Remove(quota.path)
	}
	quota.loaded = false
	quota.path = ""
	quota.state = quotaState{Date: todayKey()}
}
