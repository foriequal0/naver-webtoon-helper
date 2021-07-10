import { rearrange } from "../rearrange";
import { syncRecentViews } from "../syncRecentViews";

main().catch((e) => {
  throw e;
});

async function main() {
  await syncRecentViews();

  const container = document.querySelector<HTMLElement>(".img_list")!;
  await rearrange("webtoon", container);
}
