import { request } from "../background";
import { querySelectorAll } from "../selectors";
import { TitleState } from "../states";
import { getTitleState } from "../states/operations";
import { Detail, parseDetail, parseList } from "../url";

export async function list() {
  const list = parseList(window.location.href);
  const rows = await getRows();
  await request("sync-bulk", {
    tier: list.tier,
    titleId: list.titleId,
    states: rows.map(({ no, read }) => ({ no, read })),
  });

  // addMute(state);

  const mostRecent = rows[0];
  const state = await getTitleState(list.tier, list.titleId);
  if (!state.mute) {
    if (autoJumpMostRecent(state, mostRecent)) {
      return;
    }
  }
}

type DetailRow = Detail & { up: boolean; read: boolean };

async function getRows(): Promise<DetailRow[]> {
  const result: DetailRow[] = [];
  for (const item of await querySelectorAll('li[class^="EpisodeListList__item"]')) {
    const a = item.querySelector("a")!;
    const detail = parseDetail(a.href);
    const up = item.querySelector('i[class^="EpisodeListList__icon_bullet"]')?.textContent == "up";
    const read = [...a.classList].some((c) => c.startsWith("EpisodeListList__visited"));
    result.push({ ...detail, up, read });
  }
  return result;
}

function autoJumpMostRecent(state: TitleState, mostRecent: DetailRow) {
  if (state.hasRead(mostRecent.no - 1) && !state.hasRead(mostRecent.no)) {
    window.location.href = mostRecent.url.href;
    return true;
  }
  return false;
}
