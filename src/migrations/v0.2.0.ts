import { Tier } from "../Tier";

type TitleV1JSON = {
  // 아주 옛날버전에는 tier 가 없었어서 optional.
  tier?: Tier;
  titleId: number;
  mute: boolean;
  articles: ArticleV1JSON[];
};

type ArticleV1JSON = {
  no: number;
  readAt?: string;
  syncAt?: string;
};

type MetaV2JSON = {
  version: string;
  syncAt?: string;
};

export type TitleV2JSON = {
  tier: Tier;
  titleId: number;
  mute?: boolean;
  readAt?: string;
  articles: number[];
};

type StateV2 = {
  $meta: MetaV2JSON;
  [k: string]: TitleV2JSON | MetaV2JSON;
};

export const migration = {
  version: "0.2.0",
  async migrate() {
    const all: Record<string, TitleV1JSON> = await browser.storage.local.get();
    const migrated = migrateCore(all);
    sanityCheck(all, migrated);
    await browser.storage.sync.set(migrated);
    await browser.storage.local.clear();
  },
};

export function migrateCore(all: Record<string, TitleV1JSON>): StateV2 {
  const migrated: StateV2 = {
    $meta: {
      version: "0.2.0",
      syncAt: getSyncAt(all),
    },
  };

  for (const title of Object.values(all)) {
    const tier = title.tier ?? "webtoon";
    const key = `title:${tier}:${title.titleId}`;
    const value: TitleV2JSON = {
      tier,
      titleId: title.titleId,
      mute: title.mute ? true : undefined,
      readAt: getReadAt(title.articles),
      articles: title.articles.map((x) => x.no),
    };

    migrated[key] = value;
  }
  return migrated;
}

function getReadAt(articles: ArticleV1JSON[]): string | undefined {
  let mostRecent: Date | undefined = undefined;
  for (const article of articles) {
    const at = article.readAt ?? article.syncAt;
    if (at == undefined) {
      continue;
    }
    const date = new Date(at);
    if (mostRecent !== undefined && mostRecent >= date) {
      continue;
    }

    mostRecent = date;
  }

  return mostRecent?.toJSON();
}

function getSyncAt(all: Record<string, TitleV1JSON>): string | undefined {
  let mostRecent: Date | undefined = undefined;
  for (const title of Object.values(all)) {
    for (const article of title.articles) {
      const at = article.syncAt;
      if (at == undefined) {
        continue;
      }
      const date = new Date(at);
      if (mostRecent !== undefined && mostRecent >= date) {
        continue;
      }

      mostRecent = date;
    }
  }

  return mostRecent?.toJSON();
}

function sanityCheck(v1: Record<string, TitleV1JSON>, v2: StateV2) {
  function getKey(titleV1: TitleV1JSON) {
    return `title:${titleV1.tier ?? "webtoon"}:${titleV1.titleId}`;
  }

  if (!("$meta" in v2)) {
    throw new Error("meta not found");
  }

  const beforeKeys = new Set<string>(Object.values(v1).map(getKey));
  const afterKeys = new Set<string>(Object.keys(v2));
  for (const beforeKey of beforeKeys) {
    if (!afterKeys.has(beforeKey)) {
      throw new Error(`Key missing after migration: ${beforeKey}`);
    }
  }

  for (const titleV1 of Object.values(v1)) {
    const key = getKey(titleV1);
    const titleV2 = v2[key];
    assert("articles" in titleV2);
    const allExists = titleV1.articles.every((x) => titleV2.articles.indexOf(x.no) >= 0);
    if (!allExists) {
      throw new Error(`Articles are missing after migration: ${key}`);
    }
  }
}

function assert(value: boolean, message?: string): asserts value {
  if (!value) {
    throw Error(message ?? "Assertion failure");
  }
}
