import AsyncLock from "async-lock";
import { browser } from "webextension-polyfill-ts";

import { Tier } from "./Tier";

export class TitleState {
  public readonly tier: Tier;
  public readonly titleId: number;
  public mute: boolean;
  public readonly articles: Record<number, ArticleState>;
  public get length(): number {
    return Object.entries(this.articles).length;
  }

  public constructor(tier: Tier, titleId: number, mute: boolean, articles: Record<number, ArticleState>) {
    this.tier = tier;
    this.titleId = titleId;
    this.mute = mute;
    this.articles = articles;
  }

  public estimateLastRead(): Date | undefined {
    const articles = Object.values(this.articles);
    articles.sort((x, y) => x.no - y.no);
    for (let i = articles.length - 1; i >= 0; i--) {
      const article = articles[i];
      if (article.readAt) {
        return article.readAt;
      }
      if (article.syncAt) {
        return article.syncAt;
      }
    }
    return;
  }

  public lastReadNo(): number | undefined {
    let last: number | undefined;
    for (const value of Object.values(this.articles)) {
      if (!last || value.no > last) {
        last = value.no;
      }
    }
    return last;
  }

  public setRead(no: number): void {
    if (!this.articles[no]) {
      this.articles[no] = ArticleState.createRead(no);
    }
  }

  /**
   * @returns boolean 방금 싱크됨
   */
  public sync(no: number): boolean {
    const article = this.articles[no];
    if (article) {
      return article.setSync();
    } else {
      this.articles[no] = ArticleState.createSync(no);
      return true;
    }
  }

  public static fromJSON(json: TitleJSON): TitleState {
    const articles: Record<number, ArticleState> = Object.fromEntries(
      json.articles.map((article) => [article.no, ArticleState.fromJSON(article)])
    );
    return new TitleState(json.tier, json.titleId, json.mute, articles);
  }

  public toJSON(): TitleJSON {
    return {
      tier: this.tier,
      titleId: this.titleId,
      mute: this.mute,
      articles: Object.values(this.articles).map((article) => article.toJSON()),
    };
  }
}

export class ArticleState {
  public readonly no: number;
  public readAt?: Date;
  public syncAt?: Date;

  private constructor(no: number, readAt: Date | undefined, syncAt: Date | undefined) {
    this.no = no;
    this.readAt = readAt;
    this.syncAt = syncAt;
  }

  public static createRead(no: number): ArticleState {
    const now = new Date();
    return new ArticleState(no, now, now);
  }

  public static createSync(no: number): ArticleState {
    return new ArticleState(no, undefined, new Date());
  }

  /**
   * @returns boolean 방금 싱크됨
   */
  public setSync(): boolean {
    if (!this.syncAt) {
      this.syncAt = new Date();
      return true;
    }
    return false;
  }

  static fromJSON(json: ArticleJSON): ArticleState {
    let readAt: Date | undefined;
    if (json.readAt) {
      readAt = new Date(json.readAt);
    }
    let syncAt: Date | undefined;
    if (json.syncAt) {
      syncAt = new Date(json.syncAt);
    }

    return new ArticleState(json.no, readAt, syncAt);
  }

  toJSON(): ArticleJSON {
    return {
      no: this.no,
      readAt: this.readAt?.toJSON(),
      syncAt: this.syncAt?.toJSON(),
    };
  }
}

type TitleJSON = {
  tier: Tier;
  titleId: number;
  mute: boolean;
  articles: ArticleJSON[];
};

type ArticleJSON = {
  no: number;
  readAt?: string;
  syncAt?: string;
};

function getTitleStateKey(tier: Tier, titleId: number): string {
  return `title:${tier}:${titleId}`;
}

export async function getTitleState(tier: Tier, titleId: number): Promise<TitleState> {
  const stateKey = getTitleStateKey(tier, titleId);
  try {
    const result = await browser.storage.local.get(stateKey);
    return TitleState.fromJSON({
      tier,
      ...result[stateKey],
    });
  } catch (e) {
    return new TitleState(tier, titleId, false, {});
  }
}

export async function getTitleStates(tier: Tier, ...titleIds: number[]): Promise<TitleState[]> {
  const query: Record<string, TitleJSON> = {};
  for (const titleId of titleIds) {
    const key = getTitleStateKey(tier, titleId);
    const defaultValue = {
      tier,
      titleId,
      mute: false,
      articles: [],
    };
    query[key] = defaultValue;
  }
  const result = await browser.storage.local.get(query);
  return Object.values(result).map(TitleState.fromJSON);
}

async function setTitleState(tier: Tier, titleId: number, state: TitleState): Promise<void> {
  const stateKey = getTitleStateKey(tier, titleId);
  const json = state.toJSON();
  await browser.storage.local.set({ [stateKey]: json });
}

export async function updateTitleState<T>(
  lock: AsyncLock,
  tier: Tier,
  titleId: number,
  update: (state: TitleState) => T
): Promise<T> {
  const lockKey = getTitleStateKey(tier, titleId);
  return await lock.acquire(lockKey, async () => {
    const state = await getTitleState(tier, titleId);
    const result = update(state);
    await setTitleState(tier, titleId, state);
    return result;
  });
}

export async function exportStates(): Promise<string> {
  const state = await browser.storage.local.get();
  const result: Record<string, unknown>[] = [];
  for (const [key, value] of Object.entries(state)) {
    if (key.startsWith("title:")) {
      result.push(value);
    }
  }
  return JSON.stringify(result, null, 2);
}

export async function importStates(json: string): Promise<number> {
  const parsed = JSON.parse(json);
  const result: Record<string, unknown> = {};
  let count = 0;
  for (const item of parsed) {
    const titleState = TitleState.fromJSON(item);
    const key = getTitleStateKey(titleState.tier, titleState.titleId);
    result[key] = titleState.toJSON();
    count++;
  }
  await browser.storage.local.clear();
  await browser.storage.local.set(result);
  return count;
}
