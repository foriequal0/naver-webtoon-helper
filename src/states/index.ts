import { Tier } from "../Tier";
import { MetaJSON, TitleJSON } from "./models";

export class MetaState {
  public readonly version: string;
  public syncAt?: Date;

  private constructor(version: string, syncAt: Date | undefined) {
    this.version = version;
    this.syncAt = syncAt;
  }

  public updateSyncAt(debounce: number): boolean {
    const syncAt = this.syncAt;
    const now = new Date();

    const diff = now.getSeconds() - (syncAt?.getSeconds() ?? 0);
    if (diff < debounce) {
      return false;
    }

    this.syncAt = now;
    return true;
  }

  public static fromJSON(json: MetaJSON): MetaState {
    const syncAt = json.syncAt ? new Date(json.syncAt) : undefined;
    return new MetaState(json.version, syncAt);
  }

  public toJSON(): MetaJSON {
    return {
      version: this.version,
      syncAt: this.syncAt?.toJSON(),
    };
  }
}

export class TitleState {
  public readonly tier: Tier;
  public readonly titleId: number;
  public mute: boolean;
  public readAt?: Date;
  private readonly articles: Set<number>;
  public get length(): number {
    return this.articles.size;
  }

  private constructor(tier: Tier, titleId: number, mute: boolean, readAt: Date | undefined, articles: Set<number>) {
    this.tier = tier;
    this.titleId = titleId;
    this.mute = mute;
    this.readAt = readAt;
    this.articles = articles;
  }

  public lastReadNo(): number | undefined {
    let last: number | undefined;
    for (const value of this.articles) {
      if (last && last >= value) {
        continue;
      }

      last = value;
    }
    return last;
  }

  public hasRead(no: number): boolean {
    return this.articles.has(no);
  }

  public setRead(no: number): void {
    if (this.articles.has(no)) {
      this.articles.add(no);
      this.readAt = new Date();
    }
  }

  public static fromJSON(json: TitleJSON): TitleState {
    const mute = json.mute ?? false;
    const readAt = json.readAt ? new Date(json.readAt) : undefined;
    const articles = new Set(json.articles);
    return new TitleState(json.tier, json.titleId, mute, readAt, articles);
  }

  public toJSON(): TitleJSON {
    return {
      tier: this.tier,
      titleId: this.titleId,
      mute: this.mute ? true : undefined,
      readAt: this.readAt?.toJSON(),
      articles: [...this.articles].sort(),
    };
  }
}
