import { Tier } from "../Tier";

export type TitleJSON = {
  tier: Tier;
  titleId: number;
  mute: boolean;
  articles: ArticleJSON[];
};

export type ArticleJSON = {
  no: number;
  readAt?: string;
  syncAt?: string;
};
