import { request } from "./background";

export async function syncRecentViews(): Promise<void> {
  const debounced = await request("debounce-sync", {
    debounce: 1,
  });

  if (debounced) {
    return;
  }

  let pageNumber = 1;
  while (pageNumber != 0) {
    const page = await fetchRecentViews(pageNumber);
    if (page == null) {
      return;
    }

    let allSync = true;
    for (const item of page.itemList) {
      const tier = getTier(item.webtoonLevelCode);
      const set = await request("set-read", {
        tier,
        titleId: item.titleId,
        no: item.no,
      });
      if (!set) {
        allSync = false;
      }
    }
    if (allSync) {
      break;
    }

    pageNumber = page.pageInfo.nextPage;
  }
}

type Page = {
  pageInfo: PageInfo;
  itemList: Item[];
};

type PageInfo = {
  nextPage: number;
  // 나머지 필드 생략
};

export type Item = {
  webtoonLevelCode: "WEBTOON" | "BEST_CHALLENGE" | "CHALLENGE";
  // 작품 ID
  titleId: number;
  // 최신 회차 번호
  no: number;
  // 나머지 필드 생략
};

async function fetchRecentViews(page: number): Promise<Page | null> {
  const url = `https://comic.naver.com/api/recently/list?page=${page}&order=LAST_ARTICLE_SERVICE_DATE`;
  const res = await fetch(url);
  if (res.status == 401) {
    return null;
  }
  return res.json();
}

function getTier(code: Item["webtoonLevelCode"]) {
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
