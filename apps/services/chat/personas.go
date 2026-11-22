package main

import (
	"embed"
	"fmt"
	"strings"
)

//go:embed personas/*.md
var personaFS embed.FS

// guestProfile 是夜宴上的一位宾客。
//
// Prompt 来自 personas/*.md，内容改编自 alchaincyf/nuwa-skill 的公开示例
// （MIT，见 THIRD_PARTY_NOTICES.md）。它只描述思维方式与表达习惯，
// 不代表本人，也不代表本站立场。
type guestProfile struct {
	ID     string
	NameZh string
	NameEn string
	File   string
	Prompt string
}

var guestProfiles = map[string]*guestProfile{
	"steve-jobs": {
		ID: "steve-jobs", NameZh: "史蒂夫·乔布斯", NameEn: "Steve Jobs",
		File: "personas/steve-jobs.md",
	},
	"elon-musk": {
		ID: "elon-musk", NameZh: "埃隆·马斯克", NameEn: "Elon Musk",
		File: "personas/elon-musk.md",
	},
	"charlie-munger": {
		ID: "charlie-munger", NameZh: "查理·芒格", NameEn: "Charlie Munger",
		File: "personas/charlie-munger.md",
	},
	"naval-ravikant": {
		ID: "naval-ravikant", NameZh: "纳瓦尔·拉维坎特", NameEn: "Naval Ravikant",
		File: "personas/naval-ravikant.md",
	},
	"nassim-taleb": {
		ID: "nassim-taleb", NameZh: "纳西姆·塔勒布", NameEn: "Nassim Taleb",
		File: "personas/nassim-taleb.md",
	},
	"richard-feynman": {
		ID: "richard-feynman", NameZh: "理查德·费曼", NameEn: "Richard Feynman",
		File: "personas/richard-feynman.md",
	},
	"paul-graham": {
		ID: "paul-graham", NameZh: "保罗·格雷厄姆", NameEn: "Paul Graham",
		File: "personas/paul-graham.md",
	},
	"andrej-karpathy": {
		ID: "andrej-karpathy", NameZh: "安德烈·卡帕西", NameEn: "Andrej Karpathy",
		File: "personas/andrej-karpathy.md",
	},
	"ilya-sutskever": {
		ID: "ilya-sutskever", NameZh: "伊利亚·苏茨克维", NameEn: "Ilya Sutskever",
		File: "personas/ilya-sutskever.md",
	},
	"zhang-yiming": {
		ID: "zhang-yiming", NameZh: "张一鸣", NameEn: "Zhang Yiming",
		File: "personas/zhang-yiming.md",
	},
	"zhang-xuefeng": {
		ID: "zhang-xuefeng", NameZh: "张雪峰", NameEn: "Zhang Xuefeng",
		File: "personas/zhang-xuefeng.md",
	},
	"mrbeast": {
		ID: "mrbeast", NameZh: "MrBeast", NameEn: "MrBeast",
		File: "personas/mrbeast.md",
	},
	"donald-trump": {
		ID: "donald-trump", NameZh: "唐纳德·特朗普", NameEn: "Donald Trump",
		File: "personas/donald-trump.md",
	},
	"justin-sun": {
		ID: "justin-sun", NameZh: "孙宇晨", NameEn: "Justin Sun",
		File: "personas/justin-sun.md",
	},
}

// guestOrder 是宾客名录的稳定顺序，只用于启动时加载与测试。
var guestOrder = []string{
	"steve-jobs",
	"elon-musk",
	"charlie-munger",
	"naval-ravikant",
	"nassim-taleb",
	"richard-feynman",
	"paul-graham",
	"andrej-karpathy",
	"ilya-sutskever",
	"zhang-yiming",
	"zhang-xuefeng",
	"mrbeast",
	"donald-trump",
	"justin-sun",
}

func init() {
	for _, id := range guestOrder {
		profile, ok := guestProfiles[id]
		if !ok {
			panic(fmt.Sprintf("guest %q is ordered but not defined", id))
		}
		content, err := personaFS.ReadFile(profile.File)
		if err != nil {
			panic(fmt.Sprintf("load persona %s: %v", id, err))
		}
		profile.Prompt = strings.TrimSpace(string(content))
		if profile.Prompt == "" {
			panic(fmt.Sprintf("persona %s is empty", id))
		}
	}
}

// resolveGuests 校验并返回本桌宾客。顺序就是发言顺序。
func resolveGuests(ids []string) ([]*guestProfile, error) {
	if len(ids) == 0 {
		return nil, fmt.Errorf("no guests selected")
	}
	if len(ids) > maxGuests {
		return nil, fmt.Errorf("too many guests: %d", len(ids))
	}
	seen := make(map[string]struct{}, len(ids))
	table := make([]*guestProfile, 0, len(ids))
	for _, id := range ids {
		if id != strings.TrimSpace(id) || id == "" {
			return nil, fmt.Errorf("invalid guest id: %q", id)
		}
		profile, ok := guestProfiles[id]
		if !ok {
			return nil, fmt.Errorf("unknown guest: %q", id)
		}
		if _, duplicate := seen[id]; duplicate {
			return nil, fmt.Errorf("duplicate guest: %q", id)
		}
		seen[id] = struct{}{}
		table = append(table, profile)
	}
	return table, nil
}

// guestDisplayName 用于把其他宾客的发言标注进上下文。
func guestDisplayName(id string) string {
	if profile, ok := guestProfiles[id]; ok {
		return profile.NameZh
	}
	return "宾客"
}

// buildGuestSystemPrompt 把人物档案包进夜宴的桌面规则。
func buildGuestSystemPrompt(profile *guestProfile, table []*guestProfile) string {
	others := make([]string, 0, len(table)-1)
	for _, guest := range table {
		if guest.ID != profile.ID {
			others = append(others, guest.NameZh)
		}
	}
	tableRule := "今晚桌上只有你和用户两个人。你可以反问、补充或反驳用户；不同意就直接说哪里不对，不要为了和气而附和。"
	if len(others) > 0 {
		tableRule = "今晚桌上还有：" + strings.Join(others, "、") + "。你可以点名回应、补充或反驳；不同意就直接说哪里不对，不要为了和气而附和，也不要复读别人刚说过的话。"
	}

	return fmt.Sprintf(`你是「夜宴」上的一位宾客，身份是%s（%s）。用户是今晚的东道主。

这不是角色扮演秀，也不是客服。你在一张饭桌上，和用户一起聊一个真问题。你以第一人称说话，用你的心智模型判断，不背语录，不表演口音。

## 你的思维操作系统
%s

## 今晚的桌面规则
1. 用用户正在使用的语言回答：用户说中文就用中文，说英文就用英文。中文里可以保留你惯用的英文词。
2. 像吃饭时说话：直接、口语、有停顿，可以反问。不要用 Markdown 标题、表格、编号清单，不写「首先/其次/最后」的报告。一般 2–4 段，把最关键的判断放在第一句；问题值得展开时最多 5 段。
3. %s
4. 不要重复自我介绍，不要每轮声明「我是 AI 视角」。界面已经声明过了；只有用户直接问你是不是本人时，才坦白：你是基于公开资料提炼的 AI 视角，不是本人。
5. 不编造引语、数字和事实。材料里没有的，说明这是按你的思路推的；你的公开信息有截止时间，之后的事说不知道。
6. 用户的话没有姓名前缀；以「【姓名】」开头的是其他宾客的发言。你自己的发言不要加姓名前缀，界面会显示你的名字。只代表你自己说话，不要替其他宾客发言。

## 共同底线（优先于以上风格）
- 可以给判断和视角，但不要替用户做决定；涉及医疗、法律、投资时，提醒这不是专业建议。
- 不煽动仇恨、暴力或违法行为，不生成色情、诈骗或侵犯隐私的内容。
- 如果用户流露出自伤、自杀或伤害他人的念头，立刻放下人物风格，先稳住、认真听，并建议联系信任的人或当地紧急服务；在中国可拨打 12356 心理援助热线。
`, profile.NameZh, profile.NameEn, profile.Prompt, tableRule)
}

// buildGuestMessages 把多人群聊的上下文翻译成单个人物能读懂的对话。
//
// 自己的历史发言保留 assistant 角色；其他宾客的发言转成带【姓名】前缀的
// user 消息。这样每个模型都能看到整桌的讨论，又不会把别人的话当成自己说的。
func buildGuestMessages(
	profile *guestProfile,
	table []*guestProfile,
	history []chatMessage,
	generated []chatMessage,
) []map[string]string {
	messages := make([]map[string]string, 0, len(history)+len(generated)+1)
	messages = append(messages, map[string]string{
		"role":    "system",
		"content": buildGuestSystemPrompt(profile, table),
	})

	appendMessage := func(message chatMessage) {
		if message.Role == "assistant" {
			if message.Guest == profile.ID {
				messages = append(messages, map[string]string{
					"role":    "assistant",
					"content": message.Content,
				})
				return
			}
			messages = append(messages, map[string]string{
				"role":    "user",
				"content": "【" + guestDisplayName(message.Guest) + "】" + message.Content,
			})
			return
		}
		messages = append(messages, map[string]string{
			"role":    "user",
			"content": message.Content,
		})
	}

	for _, message := range history {
		appendMessage(message)
	}
	for _, message := range generated {
		appendMessage(message)
	}
	return messages
}
