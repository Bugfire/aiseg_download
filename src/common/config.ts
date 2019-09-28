/**
 * @license config
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

export type ConfigType = { [key: string]: ConfigType } | "number" | "string";

const IS_DRYRUN = process.env["NODE_ENV"] === "DRYRUN";
const IS_DEBUG = IS_DRYRUN || process.env["NODE_ENV"] === "DEBUG";

/* eslint-disable @typescript-eslint/no-explicit-any */
const typeOf = (obj: any): string => {
  if (Array.isArray(obj)) {
    return "array";
  } else {
    return typeof obj;
  }
};

const ArraySuffix = "_array";

function ValidateConfigRecursive(
  jsonObj: any,
  configType: ConfigType,
  errors: string[],
  path: string[]
): any {
  const jsonObjType = typeOf(jsonObj);
  const jsonObjPath = path.join(".");

  // primitive
  if (typeof configType === "string") {
    // "number" | "string"
    if (jsonObjType !== configType) {
      errors.push(`${jsonObjPath}: Expect ${configType}, but ${jsonObjType}`);
      return undefined;
    }
    return jsonObj;
  }

  // object
  if (jsonObjType !== "object") {
    errors.push(`${jsonObjPath}: Except object, but ${jsonObjType}`);
    return undefined;
  }

  const r: any = {};
  const validKeys = Object.keys(configType);
  for (const key of validKeys) {
    const isArray = key.endsWith(ArraySuffix);
    const configKeyType = configType[key];
    if (!isArray) {
      r[key] = ValidateConfigRecursive(
        jsonObj[key],
        configKeyType,
        errors,
        path.concat(key)
      );
    } else {
      const rawKey = key.substr(0, key.length - ArraySuffix.length);
      const jsonKeyObj = jsonObj[rawKey];
      const rawkeyPath = path.concat(rawKey);
      const jsonKeyType = typeOf(jsonKeyObj);
      if (jsonKeyType !== "array") {
        errors.push(`${rawkeyPath}: Except array, but ${jsonKeyType}`);
      } else {
        const array: any[] = [];
        for (let i = 0; i < jsonKeyObj.length; i++) {
          array[i] = ValidateConfigRecursive(
            jsonKeyObj[i],
            configKeyType,
            errors,
            rawkeyPath.concat(`${i}`)
          );
        }
        r[rawKey] = array;
      }
    }
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  for (const key of Object.keys(jsonObj)) {
    const configKey =
      typeOf(jsonObj[key]) === "array" ? key + ArraySuffix : key;
    if (typeof configType[configKey] === "undefined") {
      errors.push(`${path.concat(key).join(".")}: Unknown key in config`);
    }
  }

  return r;
}

export function LoadConfig<T>(configString: string, configType: ConfigType): T {
  const json = JSON.parse(configString);
  const errors: string[] = [];
  ValidateConfigRecursive(json, configType, errors, []);
  if (errors.length !== 0) {
    throw new Error(`Invalid Config\n${errors.join("\n")}`);
  }
  if (IS_DEBUG) {
    console.log(JSON.stringify(json, null, 4));
  }
  return json as T;
}
