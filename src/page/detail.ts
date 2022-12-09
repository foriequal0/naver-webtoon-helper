import { request } from "../background";
import { addMute } from "../mute";
import { getTitleState } from "../states/operations";
import { syncRecentViews } from "../syncRecentViews";
import { Tier } from "../Tier";
import { parseDetail } from "../url";

main().catch((e) => {
  throw e;
});

async function main() {
  await syncRecentViews();
  const detail = parseDetail(window.location.href);
  await request("set-read", {
    tier: detail.tier,
    titleId: detail.titleId,
    no: detail.no,
  });
  await fadeArticleNavigation(detail.tier, detail.titleId);
  const state = await getTitleState(detail.tier, detail.titleId);
  addMute(state);
}

async function fadeArticleNavigation(tier: Tier, titleId: number) {
  const navBody = document.querySelector("#comic_body")!;
  async function core() {
    const state = await getTitleState(tier, titleId);
    for (const item of navBody.querySelectorAll<HTMLDivElement>("div.item")) {
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
  new MutationObserver(core).observe(navBody, {
    subtree: true,
    childList: true,
  });
}
