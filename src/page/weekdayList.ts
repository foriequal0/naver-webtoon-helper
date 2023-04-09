import { rearrange } from "../rearrange";
import { querySelector } from "../selectors";

export async function weekdayList() {
  const list = await querySelector('ul[class^="ContentList__content_list"]');
  await rearrange("webtoon", list);
}
