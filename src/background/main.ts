import AsyncLock from "async-lock";
import { browser, Runtime } from "webextension-polyfill-ts";

import { updateTitleState } from "../TitleState";
import { InmemoryState } from "./inmemoryState";

import { PrepareSync, SetReadArgs, SyncArgs, ToggleMuteTitleArgs } from "./index";

import MessageSender = Runtime.MessageSender;

const lock = new AsyncLock();
const inMemoryState = new InmemoryState();

const handlers = {
  "set-read": async (args: SetReadArgs) => {
    return await updateTitleState(lock, args.tier, args.titleId, (state) => {
      return state.setRead(args.no);
    });
  },
  sync: async (args: SyncArgs) => {
    return await updateTitleState(lock, args.tier, args.titleId, (state) => {
      return state.sync(args.no);
    });
  },
  "toggle-mute-title": async (args: ToggleMuteTitleArgs) => {
    await updateTitleState(lock, args.tier, args.titleId, (state) => {
      state.mute = true;
    });
  },
  "debounce-sync": (args: PrepareSync) => {
    return inMemoryState.debounceSync(args.debounce);
  },
};

export type MessageType = keyof typeof handlers;
export type Message<Type extends MessageType> = {
  type: Type;
  args: MessageArgs<Type>;
};
export type MessageArgs<Type extends MessageType> = Parameters<typeof handlers[Type]>[0];
export type MessageResponse<Type extends MessageType> = Unpromisify<ReturnType<typeof handlers[Type]>>;

type Unpromisify<T> = T extends Promise<infer R> ? R : T;

async function handleMessage(message: unknown, _sender: MessageSender): Promise<unknown> {
  const { type, args } = message as Message<MessageType>;
  const handler = handlers[type];
  // @ts-ignore TS2345
  return await handler(args);
}

browser.runtime.onMessage.addListener(handleMessage);
