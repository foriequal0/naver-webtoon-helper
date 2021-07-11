import { request } from "./background";

export async function syncRecentViews(): Promise<void> {
  const debounced = await request("debounce-sync", {
    debounce: 300,
  });

  if (debounced) {
    return;
  }

  for await (const rv of fetchRecentViews()) {
    const tier = getTier(rv.webtoonLevelCode);
    const alreadySync = await request("sync", {
      tier,
      titleId: rv.titleId,
      no: rv.no,
    });

    if (alreadySync) {
      break;
    }
  }
}

export type RecentView = {
  webtoonLevelCode: "WEBTOON" | "BEST_CHALLENGE" | "CHALLENGE";
  // 작품 ID
  titleId: number;
  // 최신 회차 번호
  no: number;
  // 나머지 필드 생략
};

async function* fetchRecentViews(): AsyncGenerator<RecentView> {
  function getURL(page: number): string {
    return `https://m.comic.naver.com/api/recentlyview/get.nhn?page=${page}`;
  }

  type Page = {
    more: boolean;
    page: number;
    recentlyViewList: RecentView[];
  };

  for (let page = 1; ; page++) {
    const url = getURL(page);
    const res: Page = await fetch(url).then((x) => x.json());
    for (const recentView of res.recentlyViewList) {
      yield recentView;
    }

    if (!res.more) {
      break;
    }
  }
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
