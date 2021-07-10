import { getTier, Tier } from "./Tier";

export type Detail = {
  url: URL;
  tier: Tier;
  titleId: number;
  no: number;
}

export function parseDetail(href: string): Detail {
  const url = new URL(href);
  const tier = getTier(url);
  const titleIdStr = url.searchParams.get("titleId")!;
  const titleId = parseInt(titleIdStr);
  const noStr = url.searchParams.get("no")!;
  const no = parseInt(noStr);

  return { url, tier, titleId, no, }
}


export type List = {
  url: URL;
  tier: Tier;
  titleId: number;
  weekday?: string;
};

export function parseList(href: string): List {
  const url = new URL(href);
  const tier = getTier(url);
  const titleIdStr = url.searchParams.get("titleId")!;
  const titleId = parseInt(titleIdStr);
  const weekday = url.searchParams.get("weekday") ?? undefined;

  return { url, tier, titleId, weekday };
}
