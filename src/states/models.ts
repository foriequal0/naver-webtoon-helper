import { Tier } from "../Tier";

export type MetaJSON = {
  version: string;
  syncAt?: string;
};

export type TitleJSON = {
  tier: Tier;
  titleId: number;
  mute?: boolean;
  readAt?: string;
  articles: number[];
};
