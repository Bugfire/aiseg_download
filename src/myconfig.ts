/**
 * @license aiseg_download
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as fs from "fs";

import { LoadConfig as LC, ConfigType } from "./common/config";
import { AisegConfig, AisegConfigType } from "./common/aisegutil";

interface MyConfig {
  aiseg: AisegConfig;
}

const MyConfigType: ConfigType = {
  aiseg: AisegConfigType
};

export const LoadConfig = (filename: string) => {
  return LC<MyConfig>(
    fs.readFileSync(filename, "utf8"),
    MyConfigType
  );
};