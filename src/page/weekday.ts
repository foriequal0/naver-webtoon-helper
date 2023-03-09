import { rearrange } from "../rearrange";
import { querySelectorAll } from "../selectors";

export async function weekday() {
  for (const list of await querySelectorAll('ul[class^="WeekdayMainView__daily_list"]')) {
    await rearrange("webtoon", list);
  }
}
