// PANELOGUE - Anonymous per-API-key identity
//
// There's no account system, but shared debates still benefit from a
// stable "who made this" label so a browsable list ("내 토론 목록") makes
// sense. Deriving it from the user's own API key - hashed, never the raw
// key - gives every key a consistent nickname across sessions/devices
// without asking anyone to sign up or storing the key itself anywhere.

const ADJECTIVES = [
  '용감한', '수줍은', '날쌘', '느긋한', '예리한', '엉뚱한', '차분한', '유쾌한',
  '집요한', '섬세한', '대담한', '조용한', '반짝이는', '무던한', '까칠한', '다정한',
];

const NOUNS = [
  '여우', '고래', '부엉이', '너구리', '두루미', '수달', '표범', '까치',
  '늑대', '고슴도치', '펭귄', '기린', '오소리', '매', '다람쥐', '해달',
];

export async function hashApiKey(apiKey: string): Promise<string> {
  const bytes = new TextEncoder().encode(apiKey.trim());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Deterministic - the same key hash always maps to the same nickname, so a
// key's past shares stay recognizably "theirs" without any lookup table.
export function nicknameFromKeyHash(hash: string): string {
  const a = parseInt(hash.slice(0, 8), 16);
  const b = parseInt(hash.slice(8, 16), 16);
  return `${ADJECTIVES[a % ADJECTIVES.length]} ${NOUNS[b % NOUNS.length]}`;
}
