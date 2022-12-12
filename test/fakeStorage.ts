import { Storage } from "webextension-polyfill-ts";

export class FakeStorage implements Storage.StorageArea {
  private values: Record<string, string> = {};

  async clear(): Promise<void> {
    this.values = {};
  }

  async get(keys?: string | string[] | { [p: string]: unknown } | null): Promise<{ [p: string]: unknown }> {
    if (keys == null) {
      const result: typeof this.values = {};
      for (const key in this.values) {
        result[key] = JSON.parse(this.values[key]);
      }
      return result;
    }

    if (typeof keys == "string") {
      if (keys in this.values) {
        return {
          keys: JSON.parse(this.values[keys]),
        };
      } else {
        return {};
      }
    }

    if (Array.isArray(keys)) {
      const result: typeof this.values = {};
      for (const key of keys) {
        if (key in this.values) {
          result[key] = JSON.parse(this.values[key]);
        }
      }
      return result;
    }

    const result: Record<string, unknown> = {};
    for (const key in keys) {
      if (key in this.values) {
        result[key] = JSON.parse(this.values[key]);
      } else {
        result[key] = keys[key];
      }
    }

    return result;
  }

  async remove(keys: string | string[]): Promise<void> {
    if (typeof keys == "string") {
      delete this.values[keys];
    } else {
      for (const key of keys) {
        delete this.values[key];
      }
    }
  }

  async set(items: { [p: string]: unknown }): Promise<void> {
    for (const key in items) {
      this.values[key] = JSON.stringify(items[key]);
    }
  }
}
