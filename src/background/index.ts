import { browser } from "webextension-polyfill-ts";

import { Tier } from "../Tier";
import { MessageArgs, MessageResponse, MessageType } from "./main";

export type SetReadArgs = {
  tier: Tier;
  titleId: number;
  no: number;
};

export type SyncArgs = {
  tier: Tier;
  titleId: number;
  no: number;
};

export type ToggleMuteTitleArgs = {
  tier: Tier;
  titleId: number;
};

export type PrepareSync = {
  debounce: number;
};

export async function request<Type extends MessageType>(
  type: Type,
  args: MessageArgs<Type>
): Promise<MessageResponse<Type>> {
  return await browser.runtime.sendMessage({ type, args });
}
