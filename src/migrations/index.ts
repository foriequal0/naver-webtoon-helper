import { compare } from "compare-versions";

import * as v0_2_0 from "./v0.2.0";

const migrations = [v0_2_0.migration];
export async function migrate(from: string): Promise<void> {
  for (const migration of migrations) {
    if (compare(from, migration.version, ">=")) {
      continue;
    }

    console.log("Migration", migration.version);
    await migration.migrate();
  }
}
