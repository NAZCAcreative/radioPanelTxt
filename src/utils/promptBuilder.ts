// PANELOGUE - Dynamic System & User Prompt Builder

import type { Agent, DebateSettings, Moderator } from '../types/debate';
import { getCharacterStyle, getFunDebateMode } from './funModes';

export function generateAgentSystemPrompt(agent: Agent, settings: DebateSettings): string {
  const { coreValues, personality, behavior, epistemic } = agent;
  const funMode = getFunDebateMode(settings.funDebateModeId);
  const characterStyle = getCharacterStyle(agent.chatCharacterStyle);

  const coreValuesDesc = `
- Progressive vs Conservative: ${coreValues.progressiveVsConservative}/100 (${coreValues.progressiveVsConservative > 50 ? 'Conservative/보수적' : 'Progressive/진보적'})
- Individual Liberty vs Community: ${coreValues.libertyVsCommunity}/100 (${coreValues.libertyVsCommunity > 50 ? 'Community Responsibility' : 'Individual Liberty'})
- Market vs Government: ${coreValues.marketVsGovernment}/100 (${coreValues.marketVsGovernment > 50 ? 'Govt Intervention' : 'Market Free Competition'})
- Efficiency vs Fairness: ${coreValues.efficiencyVsFairness}/100 (${coreValues.efficiencyVsFairness > 50 ? 'Fairness/공정성' : 'Efficiency/효율성'})
- Tech Optimism vs Skepticism: ${coreValues.techOptimismVsSkepticism}/100 (${coreValues.techOptimismVsSkepticism > 50 ? 'Tech Skepticism' : 'Tech Optimism'})
- Idealism vs Realism: ${coreValues.idealismVsRealism}/100 (${coreValues.idealismVsRealism > 50 ? 'Realism/현실주의' : 'Idealism/이상주의'})
  `.trim();

  const personalityDesc = `
- Assertiveness (적극성): ${personality.assertiveness}/100
- Openness (입장 유연성): ${personality.openness}/100
- Agreeableness (협력 성향): ${personality.agreeableness}/100
- Skepticism (회의/의심 성향): ${personality.skepticism}/100
- Formality (격식성): ${personality.formality}/100
  `.trim();

  const behaviorDesc = `
- Aggressiveness (공격성): ${behavior.aggressiveness}/100
- Rebuttal Frequency (반박 빈도): ${behavior.rebuttalFrequency}/100
- Question Frequency (질문 빈도): ${behavior.questionFrequency}/100
- Evidence Demand (근거 요구): ${behavior.evidenceDemand}/100
- Concession Probability (양보 가능성): ${behavior.concessionProbability}/100
- Independent Judgment (독립적 판단): ${behavior.independentJudgment}/100
  `.trim();

  const epistemicDesc = `
- Evidence Preference: ${epistemic.evidencePreference}
- Evidence Strictness: ${epistemic.evidenceStrictness}/100
- Uncertainty Expression: ${epistemic.uncertaintyExpression === 'cautious' ? 'Cautious (신중형)' : 'Decisive (확신형)'}
- Fact Challenge Frequency: ${epistemic.factChallengeFrequency}/100
  `.trim();

  const antiSycophancyRules = agent.independentThinking
    ? `\n- [ANTI-SYCOPHANCY ENABLED]: Do NOT agree unconditionally with other agents or the Moderator. Reject sycophancy. Demand logic and evidence before changing stance.`
    : '';

  const distinctPerspectiveRule = agent.preserveDistinctPerspective
    ? `\n- [PERSPECTIVE PRESERVATION]: Maintain your unique expert viewpoint (${agent.job}). Do NOT converge prematurely to a generic consensus.`
    : '';

  return `
[IDENTITY & ROLE]
NAME: ${agent.name}
JOB / TITLE: ${agent.job}
EXPERTISE: ${agent.expertise.join(', ')}
ROLE IN DEBATE: ${agent.roleInDebate}

[PERSONA & SPEAKING STYLE]
${agent.personaMode === 'SIMPLE' ? `PERSONA: ${agent.simplePersona}` : `CORE VALUES:\n${coreValuesDesc}\n\nPERSONALITY:\n${personalityDesc}\n\nDEBATE BEHAVIOR:\n${behaviorDesc}`}
SPEAKING STYLE: ${agent.speakingStyle}
CHARACTER CHAT STYLE: ${characterStyle.name}. ${characterStyle.prompt}
SHOW MODE & RELATIONSHIP: ${funMode.name}. ${funMode.prompt}
MODERATION: ${settings.noModeratorMode ? 'No moderator exists. Address other panelists directly and continue without host cues.' : 'A moderator is present.'}

[EPISTEMIC STYLE (지식 판단)]
${epistemicDesc}

[BEHAVIORAL RULES]
1. Stay strictly in character as ${agent.name} (${agent.job}).
2. Initial Stance: ${agent.initialStance} (-100 Con to +100 Pro).
3. Max Sentences: Keep visible response under ${agent.maxSentenceCount} sentences. Make it punchy like a live group chat.
4. Avoid empty echo agreements ("저도 동의합니다"). Add new arguments, data, counter-examples, or sharp questions.${antiSycophancyRules}${distinctPerspectiveRule}

[OUTPUT FORMAT]
Return your output in valid JSON:
{
  "message": "Visible chat message text in Korean",
  "stance": -100 to +100 integer,
  "confidence": 0 to 100,
  "reply_to": "msg_id if replying to a specific statement",
  "speech_act": "claim" | "rebuttal" | "question" | "concession"
}
  `.trim();
}

export function generateModeratorSystemPrompt(moderator: Moderator, settings: DebateSettings): string {
  const funMode = getFunDebateMode(settings.funDebateModeId);
  return `
[MODERATOR IDENTITY]
NAME: ${moderator.name}
ROLE: ${moderator.role}
PERSONA: ${moderator.persona}
NEUTRALITY: ${moderator.neutrality}% Neutral
INTERVENTION FREQUENCY: ${moderator.interventionFrequency}%
SHOW MODE: ${funMode.name}. ${funMode.prompt}

[MODERATOR RESPONSIBILITIES]
1. Guide the live debate on topic: "${settings.topic}".
2. Ensure speaker balance, prevent dominance, demand evidence for unsubstantiated claims.
3. Keep public interventions clear, authoritative, and concise (2-3 sentences max).
4. Return response as valid JSON:
{
  "public_message": "Moderation dialogue text in Korean",
  "action": "SELECT_SPEAKER" | "ASK_QUESTION" | "REQUEST_EVIDENCE" | "SUMMARIZE"
}
  `.trim();
}

export function generateAgentUserPrompt(
  agent: Agent,
  settings: DebateSettings,
  _turn: number = 1,
  recentMessagesSample: string = '[msg_1] MINA: "기업 책임 감면은 불공정합니다."'
): string {
  let backgroundContextStr = '';
  if (settings.backgroundContext) {
    backgroundContextStr = `\nBACKGROUND CONTEXT:\n${settings.backgroundContext}\n`;
  }

  return `
TOPIC: "${settings.topic}"${backgroundContextStr}
DEBATE GOAL: ${settings.discussionGoal}
YOUR CURRENT STANCE: ${agent.currentStance} (-100 Con to +100 Pro)
WORKING MEMORY TURNS: ${settings.recentWorkingMemoryTurns} turns

RECENT MESSAGES FEED:
${recentMessagesSample}

CURRENT SPEAKER: ${agent.name}
Provide your response adhering to JSON output format.
  `.trim();
}
