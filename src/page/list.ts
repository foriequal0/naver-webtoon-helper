import { getDay } from "date-fns";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";
import addHours from "date-fns/addHours";

import { syncRecentViews } from "../syncRecentViews";
import { getTitleState, TitleState } from "../TitleState";
import { Detail, parseDetail, parseList } from "../url";

main().catch((e) => {
  throw e;
});

async function main() {
  await syncRecentViews();
  const list = parseList(window.location.href);
  const rows = getRows();
  const mostRecent = rows[rows.length - 1];
  const state = await getTitleState(list.tier, list.titleId);
  if (autoJumpMostRecent(state, mostRecent)) {
    return;
  }

  updateThumbnailLink(state, mostRecent);
  fadeRead(state);
  if (list.weekday) {
    refreshUntilUpdate(state, list.weekday, mostRecent);
  }
}

type DetailRow = Detail & { up: boolean };

function getRows(): DetailRow[] {
  const result: DetailRow[] = [];
  for (const title of document.querySelectorAll<HTMLElement>(".title")) {
    const element = title.closest("tr")!;
    const detail = parseDetail(element.querySelector("a")!.href);
    const up = document.querySelector("img[alt='UP']") !== undefined;
    result.push({ ...detail, up });
  }
  return result;
}

function updateThumbnailLink(state: TitleState, mostRecent: DetailRow) {
  const thumb = document.querySelector<HTMLAnchorElement>(".thumb > a")!;
  const lastSeen = state.lastReadNo();
  const url = new URL(mostRecent.url.href);
  if (!lastSeen) {
    // 본 적 없으면 첫회보기;
    url.searchParams.set("no", "1");
  } else if (lastSeen !== mostRecent.no) {
    // 마지막으로 본 화 다음화로 바로가기
    url.searchParams.set("no", (lastSeen + 1).toString());
  } else if (lastSeen === mostRecent.no) {
    // 최신회차까지 다 봤으면 썸네일 흐리게
    url.searchParams.set("no", mostRecent.no.toString());
    thumb.style.opacity = "0.5";
  }
  thumb.href = url.href;
}

function fadeRead(state: TitleState) {
  for (const title of document.querySelectorAll<HTMLElement>(".title")) {
    const row = title.closest("tr")!;
    const detail = parseDetail(row.querySelector("a")!.href);
    if (state.articles[detail.no]) {
      row.style.opacity = "0.5";
    }
  }
}

function autoJumpMostRecent(state: TitleState, mostRecent: DetailRow) {
  if (state.articles[mostRecent.no - 1] && !state.articles[mostRecent.no]) {
    window.location.href = mostRecent.url.href;
    return true;
  }
  return false;
}

function refreshUntilUpdate(state: TitleState, weekday: string, mostRecent: DetailRow) {
  const weekdays: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  // 네이버 웹툰은 1시간 일찍 공개된다
  const seoul = utcToZonedTime(new Date(), "Asia/Seoul");
  const oneHourAfter = addHours(seoul, 1);
  const day = getDay(oneHourAfter);
  const theDay = day === weekdays[weekday];

  if (theDay && !mostRecent.up && state.articles[mostRecent.no]) {
    // 1분 간격 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 60 * 1000);
  }
}
