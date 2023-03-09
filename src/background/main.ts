import AsyncLock from "async-lock";
import { browser, Runtime } from "webextension-polyfill-ts";

import { PrepareSync, SetMuteArgs, SetReadArgs, SyncBulkArgs } from "./";
import { migrate } from "../migrations";
import { updateMetaState, updateTitleState } from "../states/operations";

import MessageSender = Runtime.MessageSender;
import OnInstalledDetailsType = Runtime.OnInstalledDetailsType;

const lock = new AsyncLock();

const handlers = {
  "set-read": async (args: SetReadArgs) => {
    return await updateTitleState(lock, args.tier, args.titleId, (state) => {
      return state.setRead(args.no);
    });
  },
  "sync-bulk": async (args: SyncBulkArgs) => {
    return await updateTitleState(lock, args.tier, args.titleId, (state) => {
      for (const { no, read } of args.states) {
        state.setReadState(no, read);
      }
    });
  },
  "set-mute": async (args: SetMuteArgs) => {
    await updateTitleState(lock, args.tier, args.titleId, (state) => {
      state.mute = args.mute;
    });
  },
  "debounce-sync": (args: PrepareSync) => {
    return updateMetaState(lock, (state) => {
      return state.debounceSyncAt(args.debounce);
    });
  },
};

export type MessageType = keyof typeof handlers;
export type Message<Type extends MessageType> = {
  type: Type;
  args: MessageArgs<Type>;
};
export type MessageArgs<Type extends MessageType> = Parameters<(typeof handlers)[Type]>[0];
export type MessageResponse<Type extends MessageType> = Awaited<ReturnType<(typeof handlers)[Type]>>;

async function handleMessage<T extends MessageType>(
  message: Message<T>,
  _sender: MessageSender
): Promise<MessageResponse<T>> {
  // @ts-ignore TS 가 타입 매핑을 잘 못함
  const handler: (arg: MessageArgs<T>) => Promise<MessageResponse<T>> = handlers[message.type];
  return await handler(message.args);
}

browser.runtime.onMessage.addListener(handleMessage);

async function handleInstall(detail: OnInstalledDetailsType): Promise<void> {
  if (detail.reason !== "update" || !detail.previousVersion) {
    return;
  }

  await migrate(detail.previousVersion);
}

browser.runtime.onInstalled.addListener(handleInstall);
