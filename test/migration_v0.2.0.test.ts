import { describe, it, vi, afterEach, expect } from "vitest";

import * as v2 from "../src/migrations/v0.2.0";
import { FakeStorage } from "./fakeStorage";

vi.stubGlobal("browser", {
  storage: {
    local: new FakeStorage(),
    sync: new FakeStorage(),
  },
});

const fixture = {
  "title:webtoon:557672": {
    tier: "webtoon",
    titleId: 557672,
    mute: false,
    articles: [
      {
        no: 388,
        syncAt: "2022-02-16T14:52:19.657Z",
      },
      {
        no: 389,
        readAt: "2022-02-23T15:40:11.761Z",
        syncAt: "2022-02-23T15:40:12.117Z",
      },
      {
        no: 390,
        syncAt: "2022-03-02T15:13:00.010Z",
      },
      {
        no: 391,
        syncAt: "2022-03-09T15:01:37.155Z",
      },
    ],
  },
  "title:webtoon:626907": {
    tier: "webtoon",
    titleId: 626907,
    articles: [
      {
        no: 339,
        syncAt: "2021-07-15T15:44:39.464Z",
      },
    ],
  },
  "title:webtoon:670152": {
    tier: "webtoon",
    titleId: 670152,
    mute: true,
    articles: [
      {
        no: 274,
      },
    ],
  },
  "title:webtoon:710021": {
    titleId: 710021,
    mute: false,
    articles: [
      {
        no: 138,
        syncAt: "2021-07-15T15:44:39.358Z",
      },
    ],
  },
};

describe("migration test", function () {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should be migrated", async function () {
    await browser.storage.local.set(fixture);

    await v2.migration.migrate();

    const local = await browser.storage.local.get();
    expect(local).to.be.empty;

    const sync = await browser.storage.sync.get();
    expect(sync).to.be.deep.equal({
      $meta: {
        version: "0.2.0",
        syncAt: "2022-03-09T15:01:37.155Z",
      },
      "title:webtoon:557672": {
        tier: "webtoon",
        titleId: 557672,
        readAt: "2022-03-09T15:01:37.155Z",
        articles: [388, 389, 390, 391],
      },
      "title:webtoon:626907": {
        tier: "webtoon",
        titleId: 626907,
        readAt: "2021-07-15T15:44:39.464Z",
        articles: [339],
      },
      "title:webtoon:670152": {
        tier: "webtoon",
        titleId: 670152,
        mute: true,
        articles: [274],
      },
      "title:webtoon:710021": {
        tier: "webtoon",
        readAt: "2021-07-15T15:44:39.358Z",
        titleId: 710021,
        articles: [138],
      },
    });
  });
});
