import { detail } from "./page/detail";
import { list } from "./page/list";
import { weekday } from "./page/weekday";
import { weekdayList } from "./page/weekdayList";
import { syncRecentViews } from "./syncRecentViews";

shimLocationChangeEvent();

main().catch((e) => {
  throw e;
});

async function main() {
  window.addEventListener("locationchange", async function () {
    await route(window.location.pathname);
  });

  await syncRecentViews();
  await route(window.location.pathname);
}

async function route(path: string) {
  if (path.match(/\/(webtoon|bestChallenge|challenge)\/detail\b/)) {
    await detail();
  } else if (path.match(/\/(webtoon|bestChallenge|challenge)\/list\b/)) {
    await list();
  } else if (path.match(/\/webtoon\/\?/)) {
    await weekdayList();
  } else if (path.match(/\/webtoon\b/)) {
    await weekday();
  }
}

function shimLocationChangeEvent() {
  const oldPushState = history.pushState;
  history.pushState = function pushState(...args) {
    const ret = oldPushState.apply(this, args);
    window.dispatchEvent(new Event("pushstate"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  };

  const oldReplaceState = history.replaceState;
  history.replaceState = function replaceState(...args) {
    // @ts-ignore
    const ret = oldReplaceState.apply(this, args);
    window.dispatchEvent(new Event("replacestate"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  };

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("locationchange"));
  });
}
