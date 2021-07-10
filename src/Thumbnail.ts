import { parseList } from "./url";

export type Thumbnail = {
  titleId: number;
  fresh: boolean;
  up: boolean;
  element: HTMLElement;
};

export function parseThumbnail(thumb: HTMLElement): Thumbnail {
  const href = thumb.querySelector("a")!.href;
  const list = parseList(href);

  const fresh = thumb.querySelector("span.ico_new2") !== null;
  const up = thumb.querySelector("em.ico_updt") !== null;
  return {
    titleId: list.titleId,
    fresh,
    up,
    element: thumb,
  };
}
