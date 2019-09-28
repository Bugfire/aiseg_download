/**
 * @license aisegutil.ts
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import axios from "axios";

import { ConfigType } from "./config";

const IS_DRYRUN = process.env["NODE_ENV"] === "DRYRUN";
const IS_DEBUG = IS_DRYRUN || process.env["NODE_ENV"] === "DEBUG";

export interface AisegConfig {
  host: string;
  port: number;
  auth: string;
}

export const AisegConfigType: ConfigType = {
  host: "string",
  port: "number",
  auth: "string"
};

export const Fetch = async (
  path: string,
  config: AisegConfig
): Promise<Buffer> => {
  const auth = config.auth.split(":");
  const url = `http://${config.host}:${config.port}${path}`;
  if (IS_DEBUG) {
    console.log(`Fetching ${url}...`);
  }
  const res = await axios.get(url, {
    auth: {
      username: auth[0],
      password: auth[1]
    },
    responseType: "arraybuffer"
  });
  if (IS_DEBUG && res.data instanceof Buffer) {
    console.log(`  Done ${res.data.length} bytes`);
  }
  return res.data as Buffer;
};
