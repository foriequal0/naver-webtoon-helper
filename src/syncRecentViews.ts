import { request } from "./background";

export async function syncRecentViews(): Promise<void> {
  const debounced = await request("debounce-sync", {
    debounce: 600,
  });

  if (debounced) {
    return;
  }

  for (let pageNumber = 1; ; pageNumber++) {
    const page = await fetchRecentViews(pageNumber);
    let allSync = true;
    for (const rv of page.recentlyViewList) {
      const tier = getTier(rv.webtoonLevelCode);
      const set = await request("set-read", {
        tier,
        titleId: rv.titleId,
        no: rv.no,
      });
      if (!set) {
        allSync = false;
      }
    }
    if (allSync) {
      break;
    }
  }
}

type Page = {
  more: boolean;
  recentlyViewList: RecentView[];
};

export type RecentView = {
  webtoonLevelCode: "WEBTOON" | "BEST_CHALLENGE" | "CHALLENGE";
  // 작품 ID
  titleId: number;
  // 최신 회차 번호
  no: number;
  // 나머지 필드 생략
};

async function fetchRecentViews(page: number): Promise<Page> {
  const url = `https://m.comic.naver.com/api/recentlyview/get.nhn?page=${page}`;
  const res = await fetch(url);
  return res.json();
}

function getTier(code: RecentView["webtoonLevelCode"]) {
  switch (code) {
    case "WEBTOON":
      return "webtoon";
    case "BEST_CHALLENGE":
      return "bestChallenge";
    case "CHALLENGE":
      return "challenge";
    default:
      throw new Error(`Unexpected webtoonLevelCode: ${code}`);
  }
}
