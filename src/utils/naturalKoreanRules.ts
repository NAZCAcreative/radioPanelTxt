// PANELOGUE - Anti "AI-tell" Korean phrasing rules
//
// Distilled from the AI-tell taxonomy used by community de-AI-ification
// tools (e.g. github.com/epoko77-ai/im-not-ai): the small set of Korean
// phrasing patterns that read as machine-translated or LLM-generated even
// to a casual reader - stacked "~할 수 있다", translation-ese connectives,
// report-style summary tics, hype clichés, and mechanically uniform
// sentence rhythm. Panelogue's whole premise is a live group chat, so this
// gets folded into every panelist/moderator system prompt instead of
// leaving natural-sounding Korean to chance.
export const NATURAL_KOREAN_STYLE_RULES = `
NATURAL KOREAN, NOT TRANSLATION-ESE OR AI CLICHES (native readers spot these instantly):
- Never end with report-style summary tics: "결론적으로", "요약하자면", "이를 통해", "그러므로", "~라고 할 수 있다".
- Never use hype clichés: "혁신적", "획기적", "압도적", "파격적", "폭발적".
- Avoid translated phrasing: "~에 대하여/대해서", "~를 통해", "~에 있어(서)", "~와 관련하여", "~가지고 있다" (say "강하다", not "강점을 가지고 있다"), "~에 의해" passive voice, stacking "~할 수 있다" on every sentence.
- Don't repeat the "A인가, B인가" contrastive-pair rhetorical device, and don't put a comma right after "-고/-며/-지만/-면서".
- Don't list with "첫째/둘째/셋째" or "1) 2) 3)", and don't end 3+ sentences in a row the same way ("~이다/~한다" repeated).
- Skip hedging chains ("~로 보여질 수 있다는 점에서"); say what you mean directly.
Write the way a real person would actually type in a live group chat, not a written report.
`.trim();
