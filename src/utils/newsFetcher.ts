export interface HotNewsItem {
  topic: string;
  category: string;
  backgroundContext: string;
}

export const HOT_NEWS_TOPICS: HotNewsItem[] = [
  {
    category: '기술 / 노동',
    topic: '생성형 AI 도입에 따른 일자리 대체와 로봇세(Robot Tax) 신설 의무화 논란',
    backgroundContext: 'AI 기술의 급격한 발전으로 금융·IT·사무 직군에서 일자리 대체가 가속화되고 있습니다. 정부가 AI 도입 기업에 로봇세를 부과하여 근로자 재교육 기금을 조성하자는 입법안을 발의하자, 산업계는 혁신 저해라며 강력 반발하고 있습니다.',
  },
  {
    category: '경제 / 사회',
    topic: '주 4일 근무제(주 32시간) 법정 의무화 추진 및 임금 보전 분쟁',
    backgroundContext: '생산성 향상과 워라밸 조성을 목적으로 주 4일 근무제 법정화 법안이 제출되었습니다. 노동계는 임금 삭감 없는 주 4일제를 요구하는 반면, 경영계는 중소기업 생존 위기와 일손 부족을 이유로 반대하고 있습니다.',
  },
  {
    category: '복지 / 금융',
    topic: '초고령화 사회 진입에 따른 국민연금 수급 연령 연장 및 보험료율 인상안',
    backgroundContext: '2026년 한국이 초고령 사회에 도달함에 따라 연금 기금 고갈 시점이 당겨졌습니다. 정부의 보험료율 인상 및 수급 연령(65세→68세) 상향 조정안에 대해 세대 간 형평성과 노후 빈곤 문제를 두고 논쟁이 과열되고 있습니다.',
  },
  {
    category: '디지털 / 통화',
    topic: '중앙은행 디지털 화폐(CBDC) 전면 도입과 현금 발행 단계적 중단',
    backgroundContext: '한국은행이 디지털 원화(CBDC) 상용화 단계를 발표했습니다. 거래 투명성과 금융 효율성 향상이라는 찬성론과 개인 프라이버시 침해, 금융 소외 계층의 피해라는 반대론이 팽팽히 맞서고 있습니다.',
  },
  {
    category: '환경 / 산업',
    topic: '일회용 플라스틱 전면 금지법 시행과 소상공인 규제 유예 논쟁',
    backgroundContext: '기후 위기 대응을 위한 플라스틱 제로 법안이 국회를 통과하면서 억제 정책이 강화되었습니다. 환경 단체는 즉시 시행을 촉구하고 있으나 자영업자 협회는 원가 상승과 대체재 부족으로 가혹하다고 주장하고 있습니다.',
  },
  {
    category: '부동산 / 도시',
    topic: '청년/신혼부부 대상 공공임대주택 확대와 기존 주택 가격 하락 우려',
    backgroundContext: '도심 핵심 지역에 30만 가구 규모의 고품질 공공임대주택 건립 구상이 발표되었습니다. 주거 안정에 필수적이라는 입장과 지역 주민들의 재산권 침해 및 학군 초과 과밀화 반대 목소리가 대립하고 있습니다.',
  },
];

let lastNewsIndex = -1;

export function fetchRandomHotNews(): HotNewsItem {
  let nextIndex = Math.floor(Math.random() * HOT_NEWS_TOPICS.length);
  if (nextIndex === lastNewsIndex) {
    nextIndex = (nextIndex + 1) % HOT_NEWS_TOPICS.length;
  }
  lastNewsIndex = nextIndex;
  return HOT_NEWS_TOPICS[nextIndex];
}

// --- LIVE NEWS (OpenRouter Chat Completions) ---
// Reuses the same OpenRouter API key already configured for the debate
// itself - no separate news API/key needed. Without a key, or if the call
// fails for any reason, this transparently falls back to the curated static
// list above so the button always works.

export interface LiveHotNewsResult extends HotNewsItem {
  isLive: boolean;
  candidateCount: number;
  // Set only when a key WAS provided but the live fetch still failed, so the
  // caller can tell "no key entered" (expected, silent) apart from
  // "key entered but something went wrong" (worth surfacing to the user).
  keyErrorMessage?: string;
}

// HTTP header values must be Latin-1 (ISO-8859-1) encodable per the Fetch
// spec. Keys copied from rich-text sources can carry invisible characters
// or smart quotes outside that range, which throws a raw, unreadable
// "non ISO-8859-1 code point" TypeError from fetch() itself.
function sanitizeApiKey(key: string): string {
  return key.trim().replace(/[^\x20-\x7E]/g, '');
}

export async function fetchHotNews(apiKey: string, model: string, requestedCount = 10): Promise<LiveHotNewsResult> {
  const candidateCount = Math.max(1, Math.min(20, Math.round(requestedCount)));
  const cleanKey = sanitizeApiKey(apiKey);
  if (!cleanKey) {
    return { ...fetchRandomHotNews(), isLive: false, candidateCount: Math.min(candidateCount, HOT_NEWS_TOPICS.length) };
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
        'X-Title': 'Panelogue',
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-5',
        messages: [
          {
            role: 'system',
            content:
              `당신은 찬반 토론에 적합한 한국 사회의 오늘자 시사 이슈를 추천하는 큐레이터입니다. 서로 중복되지 않는 후보 ${candidateCount}개를 만들고, 다른 설명 없이 반드시 다음 JSON 객체 하나만 응답하세요: {"items":[{"topic":"찬반이 갈리는 구체적인 토론 주제 한 문장","category":"분야","backgroundContext":"오늘 기준 배경과 핵심 쟁점 2~3문장"}]}`,
          },
          {
            role: 'user',
            content: `지금 한국 사회에서 찬반 토론하기 좋은 오늘의 뉴스 주제 후보를 정확히 ${candidateCount}개 추천해줘.`,
          },
        ],
        temperature: 1,
        max_tokens: Math.min(4000, 300 + candidateCount * 180),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error?.message || `OpenRouter API 오류 (${res.status})`);
    }

    const data = await res.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('응답에 내용이 없습니다.');

    // Models don't always honor "JSON only" - strip code fences and pull out
    // the first {...} block rather than assuming the whole string parses.
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('응답에서 JSON을 찾지 못했습니다.');
    const parsed = JSON.parse(jsonMatch[0]);
    const rawItems: unknown[] = Array.isArray(parsed.items) ? parsed.items : [parsed];
    const items: HotNewsItem[] = rawItems
      .filter((item: unknown): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .flatMap((item) => {
        if (typeof item.topic !== 'string' || !item.topic.trim()) return [];
        return [{
          topic: item.topic.trim(),
          category: typeof item.category === 'string' && item.category.trim() ? item.category.trim() : '종합',
          backgroundContext: typeof item.backgroundContext === 'string' ? item.backgroundContext.trim() : '',
        }];
      })
      .slice(0, candidateCount);
    if (!items.length) throw new Error('뉴스 주제 후보를 가져오지 못했습니다.');
    const selected = items[Math.floor(Math.random() * items.length)];

    return {
      ...selected,
      isLive: true,
      candidateCount: items.length,
    };
  } catch (error) {
    console.warn('OpenRouter 핫 뉴스 가져오기 실패, 예시 주제로 대체합니다:', error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...fetchRandomHotNews(),
      isLive: false,
      candidateCount: Math.min(candidateCount, HOT_NEWS_TOPICS.length),
      keyErrorMessage: message,
    };
  }
}
