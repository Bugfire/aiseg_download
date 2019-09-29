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
  user: string;
  password: string;
}

export const AisegConfigType: ConfigType = {
  host: "",
  port: 0,
  user: "",
  password: ""
};

export const Fetch = async (
  path: string,
  config: AisegConfig
): Promise<Buffer> => {
  const url = `http://${config.host}:${config.port}${path}`;
  if (IS_DEBUG) {
    console.log(`Fetching ${url}...`);
  }
  const res = await axios.get(url, {
    auth: {
      username: config.user,
      password: config.password
    },
    responseType: "arraybuffer"
  });
  if (IS_DEBUG && res.data instanceof Buffer) {
    console.log(`  Done ${res.data.length} bytes`);
  }
  return res.data as Buffer;
};
