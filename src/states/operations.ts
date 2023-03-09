import AsyncLock from "async-lock";
import { browser } from "webextension-polyfill-ts";

import { MetaState, TitleState } from "./";
import { TitleJSON } from "./models";
import { Tier } from "../Tier";

function getTitleStateKey(tier: Tier, titleId: number): string {
  return `title:${tier}:${titleId}`;
}

export async function getTitleState(tier: Tier, titleId: number): Promise<TitleState> {
  const stateKey = getTitleStateKey(tier, titleId);
  const result = await browser.storage.sync.get(stateKey);
  return TitleState.fromJSON({
    tier,
    titleId,
    ...result[stateKey],
  });
}

export async function getTitleStates(tier: Tier, ...titleIds: number[]): Promise<TitleState[]> {
  const query: Record<string, TitleJSON> = {};
  for (const titleId of titleIds) {
    const key = getTitleStateKey(tier, titleId);
    const defaultValue: TitleJSON = {
      tier,
      titleId,
      articles: [],
    };
    query[key] = defaultValue;
  }
  const result = await browser.storage.sync.get(query);
  return Object.values(result).map(TitleState.fromJSON);
}

async function setTitleState(tier: Tier, titleId: number, state: TitleState): Promise<void> {
  const stateKey = getTitleStateKey(tier, titleId);
  const json = state.toJSON();
  await browser.storage.sync.set({ [stateKey]: json });
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

export async function updateMetaState<T>(lock: AsyncLock, update: (state: MetaState) => T): Promise<T> {
  return await lock.acquire("$meta", async () => {
    const json = await browser.storage.sync.get({ $meta: {} });
    const meta = MetaState.fromJSON(json["$meta"]);
    const result = update(meta);
    const updatedJson = meta.toJSON();
    await browser.storage.sync.set({ $meta: updatedJson });
    return result;
  });
}

export async function exportStates(): Promise<string> {
  const state = await browser.storage.sync.get();
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
  await browser.storage.sync.clear();
  await browser.storage.sync.set(result);
  return count;
}
