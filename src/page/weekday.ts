import { rearrange } from "../rearrange";
import { syncRecentViews } from "../syncRecentViews";

main().catch((e) => {
  throw e;
});

async function main() {
  await syncRecentViews();

  for (const column of document.querySelectorAll("div.col")) {
    const container = column.querySelector<HTMLElement>("ul")!;
    await rearrange("webtoon", container);
  }
}
