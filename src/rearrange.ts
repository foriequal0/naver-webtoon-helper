import { parseThumbnail, Thumbnail } from "./Thumbnail";
import { Tier } from "./Tier";
import { getTitleStates, TitleState } from "./TitleState";

export async function rearrange(tier: Tier, thumbsContainer: HTMLElement): Promise<void> {
  const thumbs = [];
  for (const thumb of thumbsContainer.children as HTMLCollectionOf<HTMLElement>) {
    thumbs.push(parseThumbnail(thumb));
  }

  const grouped = await group(tier, thumbs);

  thumbsContainer.innerHTML = "";
  for (const thumb of [...grouped.actives, ...grouped.freshes]) {
    thumbsContainer.appendChild(thumb.element);
  }
  for (const thumb of grouped.inactives) {
    thumb.element.style.opacity = "0.3";
    thumbsContainer.appendChild(thumb.element);
  }
}

type SortResult = {
  actives: Thumbnail[];
  inactives: Thumbnail[];
  freshes: Thumbnail[];
};

async function group(tier: Tier, thumbs: Thumbnail[]): Promise<SortResult> {
  const actives = [];
  const inactives = [];
  const freshes = [];
  const now = Date.now();
  const states: Record<number, TitleState> = {};
  for (const state of await getTitleStates(tier, ...thumbs.map((x) => x.titleId))) {
    states[state.titleId] = state;
  }

  for (const thumb of thumbs) {
    const state = states[thumb.titleId];
    const lastRead = state.estimateLastRead();
    const readIn = (weeks: number): boolean => {
      if (!lastRead) {
        return false;
      }
      const DAYS_OFFSET = 1;
      const ms = (weeks * 7 + DAYS_OFFSET) * 24 * 60 * 60 * 1000;
      return now - lastRead.getTime() < ms;
    };

    // TODO : 휴재하면 내리고 재개하면 위로 올리기
    if (readIn(3)) {
      // 3주 이내에 본 적 있음
      actives.push(thumb);
    } else if (thumb.fresh) {
      freshes.push(thumb);
    } else {
      inactives.push(thumb);
    }
  }

  inactives.sort((a, b) => {
    const lengthA = states[a.titleId].length;
    const lengthB = states[b.titleId].length;
    // seen이 더 많으면 더 상위권으로 정렬됨
    return -(lengthA - lengthB);
  });

  return { actives, inactives, freshes };
}
