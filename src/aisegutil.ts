/**
 * @license aisegutil.ts
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import axios from "axios";

import { ConfigType } from "./config";

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
  const res = await axios.get(`http://${config.host}:${config.port}/${path}`, {
    auth: {
      username: auth[0],
      password: auth[1]
    },
    responseType: "arraybuffer"
  });
  return res.data as Buffer;
};
