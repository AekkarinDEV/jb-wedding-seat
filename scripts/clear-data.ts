import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../.env.local") });

import { db } from "../src/db";
import { guests } from "../src/db/schema";

async function main() {
  console.log("Clearing old guests from the database...");
  await db.delete(guests);
  console.log("✅ Successfully cleared all old data from the database.");
  process.exit(0);
}

main().catch(console.error);
