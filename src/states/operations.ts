import AsyncLock from "async-lock";
import { browser } from "webextension-polyfill-ts";

import { Tier } from "../Tier";
import { TitleState } from "./";
import { TitleJSON } from "./models";

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
