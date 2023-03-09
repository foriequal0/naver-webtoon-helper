import { browser } from "webextension-polyfill-ts";

import { MessageArgs, MessageResponse, MessageType } from "./main";
import { Tier } from "../Tier";

export type SetReadArgs = {
  tier: Tier;
  titleId: number;
  no: number;
};

export type SyncBulkArgs = {
  tier: Tier;
  titleId: number;
  states: { no: number; read: boolean }[];
};

export type SetMuteArgs = {
  tier: Tier;
  titleId: number;
  mute: boolean;
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
