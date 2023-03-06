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

  const fresh = (() => {
    for (const bullet of thumb.querySelectorAll('i[class^="Poster__icon_bullet"]')) {
      if (bullet.textContent == "신작") {
        return true;
      }
    }
    return false;
  })();
  const up = (() => {
    for (const bullet of thumb.querySelectorAll('i[class^="ContentTitle__icon_bullet"]')) {
      if (bullet.textContent == "UP") {
        return true;
      }
    }
    return false;
  })();
  return {
    titleId: list.titleId,
    fresh,
    up,
    element: thumb,
  };
}
