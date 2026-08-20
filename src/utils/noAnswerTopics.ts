import type { HotNewsItem } from './newsFetcher';

// Classic Korean "답이 없는 논쟁" (unwinnable, no-right-answer) debate topics -
// the "깻잎 논쟁" genre. These are evergreen (not news-driven), so they're a
// fixed curated list rather than fetched live, and are meant to be browsed
// and picked by the user rather than randomly assigned.
export const NO_ANSWER_TOPICS: HotNewsItem[] = [
  {
    category: '연애 / 관계',
    topic: '여자친구 남사친이 회식 자리에서 깻잎을 떼어줬다, 화내야 할까?',
    backgroundContext:
      '커플과 친구들이 함께한 술자리. 깻잎장아찌가 서로 붙어 잘 안 떨어지자, 여자친구 옆에 앉아 있던 남사친이 자연스럽게 젓가락으로 떼어줬다. 남자친구는 그 장면을 보고 기분이 묘해졌지만, 여자친구는 "그냥 친구끼리 매너인데 뭐가 문제냐"는 입장이다. 수년째 한국 인터넷에서 결론이 나지 않는 대표적인 밸런스 게임.',
  },
  {
    category: '음식 취향',
    topic: '민트초코는 맛있는 디저트인가, 치약 맛 재앙인가?',
    backgroundContext:
      '민트초코 아이스크림과 빵이 나올 때마다 온라인은 "민초파"와 "반민초파"로 갈라진다. 민초파는 상쾌한 청량감을 극찬하고, 반민초파는 "치약을 씹는 맛"이라며 강하게 거부한다. 수십 년째 승부가 나지 않는 국룰 논쟁.',
  },
  {
    category: '음식 취향',
    topic: '탕수육 소스는 부어 먹어야 하는가, 찍어 먹어야 하는가?',
    backgroundContext:
      '바삭한 탕수육이 나오면 항상 등장하는 논쟁. 부먹파는 "바삭함은 순간이고 맛의 조화가 더 중요하다"고 주장하고, 찍먹파는 "바삭함을 지키는 게 예의"라고 맞선다. 중국집 단체 회식마다 재점화되는 단골 소재.',
  },
  {
    category: '음식 취향',
    topic: '계란후라이는 반숙이 진리인가, 완숙이 진리인가?',
    backgroundContext:
      '노른자가 흘러내리는 반숙파와, 비린내 걱정 없는 완숙파가 팽팽하게 맞선다. 밥에 비벼먹을 때 반숙의 진가가 드러난다는 주장과, 완숙이 더 안전하고 고소하다는 주장이 매번 충돌한다.',
  },
  {
    category: '생활 습관',
    topic: '라면 끓일 때 스프가 먼저인가, 면이 먼저인가?',
    backgroundContext:
      '봉지 뒷면 레시피와 별개로 각자의 "국룰"이 따로 있다. 스프 먼저파는 "물맛이 먼저 배어야 한다"고 하고, 면 먼저파는 "면이 빨리 익어야 꼬들함이 산다"고 맞선다. 스프-면-스프 순서파까지 등장하며 끝나지 않는 논쟁.',
  },
  {
    category: '생활 습관',
    topic: '두루마리 휴지는 끝이 앞으로 나오게 걸어야 하는가, 뒤로 걸어야 하는가?',
    backgroundContext:
      '휴지 걸이에 휴지를 걸 때 끝부분이 바깥으로 나오게 거는 사람과 벽 쪽으로 나오게 거는 사람이 나뉜다. 앞으로파는 "뜯기 편하다"고, 뒤로파는 "깔끔해 보이고 반려동물이 못 건드린다"고 주장한다.',
  },
  {
    category: '생활 습관',
    topic: '집에서는 슬리퍼를 신어야 하는가, 맨발이 편한가?',
    backgroundContext:
      '위생과 발 건강을 이유로 실내 슬리퍼를 고수하는 사람과, 답답함 없이 맨발이 최고라는 사람이 나뉜다. 동거·신혼부부 사이에서 자주 터지는 생활 습관 갈등 중 하나.',
  },
  {
    category: '직장 / 사회생활',
    topic: '카페에서 노트북 펴고 몇 시간씩 있는 건 민폐인가, 자유인가?',
    backgroundContext:
      '커피 한 잔 시켜놓고 서너 시간씩 노트북으로 공부·업무를 하는 "카공족"을 두고, 회전율에 피해를 준다는 카페 사장 입장과 정당하게 돈을 낸 손님인데 뭐가 문제냐는 손님 입장이 부딪힌다.',
  },
  {
    category: '연애 / 관계',
    topic: '연인 사이 카톡 답장이 늦으면 서운해해도 되는가?',
    backgroundContext:
      '한쪽은 "바쁘면 늦을 수도 있지, 왜 집착하냐"는 입장이고 다른 한쪽은 "1분이면 보내는 답장 하나가 배려"라고 주장한다. 매번 다투다가도 결론 없이 흐지부지되는 커플 단골 갈등.',
  },
  {
    category: '연애 / 관계',
    topic: '연애할 때 데이트 비용은 반반이 맞는가, 한쪽이 더 내야 하는가?',
    backgroundContext:
      '평등한 관계를 위해 무조건 더치페이해야 한다는 입장과, 소득 차이나 역할을 고려해 한쪽이 더 부담하는 게 자연스럽다는 입장이 팽팽하다. 연애 초반 커플 사이에서 특히 자주 터지는 화두.',
  },
  {
    category: '가족 / 전통',
    topic: '명절에 시댁을 먼저 가야 하는가, 처가/친정을 먼저 가야 하는가?',
    backgroundContext:
      '전통적으로 시댁을 먼저 방문하는 관습과, 부부 평등을 이유로 매년 번갈아 가거나 동등하게 시간을 배분해야 한다는 입장이 명절마다 갈등을 빚는다.',
  },
  {
    category: '사회생활',
    topic: '결혼식 축의금은 얼마가 적당한가?',
    backgroundContext:
      '5만원, 10만원, 그 이상까지 - 축의금 액수를 두고 매번 고민이 깊어진다. 밥값과 별개로 순수 축하 명목이어야 한다는 입장과, 요즘 물가엔 최소 10만원이 국룰이라는 입장이 부딪힌다.',
  },
  {
    category: '사회 매너',
    topic: '비어있는 지하철 임산부석에 임산부가 없으면 앉아도 되는가?',
    backgroundContext:
      '자리가 비어있으면 잠깐 앉았다가 임산부가 타면 양보하면 된다는 입장과, 빈자리라도 임산부를 위해 절대 앉지 말아야 한다는 입장이 대립한다.',
  },
  {
    category: '사회 매너',
    topic: '같은 아파트/회사 엘리베이터에서 모르는 사람에게 인사해야 하는가?',
    backgroundContext:
      '먼저 인사하는 게 당연한 예의라는 입장과, 모르는 사람에게 인사를 강요받는 건 부담스럽다는 입장이 세대와 지역에 따라 다르게 갈린다.',
  },
  {
    category: '연애 / 관계',
    topic: '회식·술자리에서 애인이 이성 옆에 앉는 게 문제가 되는가?',
    backgroundContext:
      '자리 배치는 우연일 뿐이라는 입장과, 애인이 있다면 최대한 이성 옆자리를 피하는 게 배려라는 입장이 커플 사이에서 자주 부딪힌다.',
  },
  {
    category: '연애 / 관계',
    topic: '새 연애를 시작하면 전 애인 연락처는 반드시 지워야 하는가?',
    backgroundContext:
      '미련이 없다면 번호가 남아있어도 상관없다는 입장과, 새 애인에 대한 최소한의 예의로 지우는 게 맞다는 입장이 팽팽히 맞선다.',
  },
  {
    category: '생활 문화',
    topic: '반려동물에게 사람 이름(예: 철수, 영희)을 지어줘도 괜찮은가?',
    backgroundContext:
      '반려동물도 가족이니 어떤 이름이든 괜찮다는 입장과, 실제 그 이름을 가진 지인이 있으면 나중에 부르기 애매하고 불편한 상황이 생길 수 있다는 입장이 있다.',
  },
  {
    category: '음식 취향',
    topic: '냉면은 물냉면이 진리인가, 비빔냉면이 진리인가?',
    backgroundContext:
      '시원한 육수의 물냉면파와 매콤달콤한 양념의 비빔냉면파가 여름마다 격돌한다. 둘 다 시켜서 나눠먹으면 되지 않냐는 중재파도 있지만 근본적 우위 논쟁은 끝나지 않는다.',
  },
  {
    category: '생활 문화',
    topic: '대중목욕탕에서 때를 미는 것은 필수 문화인가, 개인 선택인가?',
    backgroundContext:
      '몸을 개운하게 하려면 주기적으로 때를 밀어야 한다는 입장과, 피부 자극이 심하고 개인 취향일 뿐이라는 입장이 세대 간 온도차를 보이며 부딪힌다.',
  },
  {
    category: '생활 문화',
    topic: '집들이 온 손님이 실내에서 잠깐이라도 신발을 신고 있어도 되는가?',
    backgroundContext:
      '우리 집 문화를 존중해서 무조건 벗어야 한다는 입장과, 짐만 놓으러 잠깐 들어온 거면 융통성 있게 넘어가도 된다는 입장이 부딪힌다.',
  },
];

let lastNoAnswerIndex = -1;

export function fetchRandomNoAnswerTopic(): HotNewsItem {
  let nextIndex = Math.floor(Math.random() * NO_ANSWER_TOPICS.length);
  if (nextIndex === lastNoAnswerIndex) {
    nextIndex = (nextIndex + 1) % NO_ANSWER_TOPICS.length;
  }
  lastNoAnswerIndex = nextIndex;
  return NO_ANSWER_TOPICS[nextIndex];
}
