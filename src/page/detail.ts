import { request } from "../background";
import { addMute } from "../mute";
import { querySelector } from "../selectors";
import { getTitleState } from "../states/operations";
import { Tier } from "../Tier";
import { parseDetail } from "../url";

export async function detail() {
  const detail = parseDetail(window.location.href);
  await request("set-read", {
    tier: detail.tier,
    titleId: detail.titleId,
    no: detail.no,
  });
  await fadeArticleNavigation(detail.tier, detail.titleId);
  // const state = await getTitleState(detail.tier, detail.titleId);
  // addMute(state);
}

async function fadeArticleNavigation(tier: Tier, titleId: number) {
  const episodeList = await querySelector('[class^="ViewerView__episode_list_wrap"]')!;
  async function core() {
    const state = await getTitleState(tier, titleId);
    for (const item of episodeList.querySelectorAll<HTMLDivElement>('div[class^="ViewerEpisode__item"]')) {
      const a = item.querySelector("a");
      if (!a) {
        continue;
      }
      const detail = parseDetail(a.href);
      if (state.hasRead(detail.no)) {
        item.style.opacity = "0.5";
      }
    }
  }

  await core();
  new MutationObserver(core).observe(episodeList, {
    subtree: true,
    childList: true,
  });
}
