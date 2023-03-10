import { request } from "./background";

const SyncTolerance = 300;

export async function syncRecentViews(): Promise<void> {
  const lastSync = await request("prepare-sync", {
    debounce: 600,
  });

  if (!lastSync) {
    return;
  }

  let pageNumber = 1;
  while (pageNumber != 0) {
    const page = await fetchRecentViews(pageNumber);
    if (page == null) {
      return;
    }

    let continuePage = true;
    for (const item of page.itemList) {
      const tier = getTier(item.webtoonLevelCode);
      const [year, month, day, hour, min, sec] = item.readDate;
      const readDate = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}+09:00`);
      if (readDate.getSeconds() + SyncTolerance < lastSync.getSeconds()) {
        continuePage = false;
        break;
      }

      await request("set-read", {
        tier,
        titleId: item.titleId,
        no: item.no,
      });
    }

    if (!continuePage) {
      break;
    }

    pageNumber = page.pageInfo.nextPage;
  }

  await request("done-sync", {});
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
  // 읽은 시간
  readDate: [year: number, month: number, day: number, hour: number, min: number, sec: number, ns: number];
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
