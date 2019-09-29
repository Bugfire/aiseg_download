/**
 * @license config.ts
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

type ConfigTypeElement = 0 | "" | ConfigTypeDict;
type ConfigTypeArray = [ConfigTypeElement];
type ConfigTypeDict = { [key: string]: ConfigType };
export type ConfigType = ConfigTypeElement | ConfigTypeArray;

const IS_DRYRUN = process.env["NODE_ENV"] === "DRYRUN";
const IS_DEBUG = IS_DRYRUN || process.env["NODE_ENV"] === "DEBUG";

type TypeName = "array" | "object" | "number" | "string" | "unknown";

/* eslint-disable @typescript-eslint/no-explicit-any */
const getTypeNameFromJsonObj = (obj: any): TypeName => {
  if (Array.isArray(obj)) {
    return "array";
  } else {
    const typeName = typeof obj;
    if (
      typeName === "object" ||
      typeName === "number" ||
      typeName === "string"
    ) {
      return typeName;
    }
  }
  return "unknown";
};

const getTypeNameFromConfigType = (obj: ConfigType): TypeName => {
  if (Array.isArray(obj)) {
    return "array";
  } else if (typeof obj === "object") {
    return "object";
  } else if (obj === 0) {
    return "number";
  } else if (obj === "") {
    return "string";
  } else {
    return "unknown";
  }
};

function ValidateConfigRecursive(
  jsonObj: any,
  configType: ConfigType,
  errors: string[],
  path: string[]
): any {
  const typeNameFromJsonObj = getTypeNameFromJsonObj(jsonObj);
  const typeNameFromConfigType = getTypeNameFromConfigType(configType);
  const jsonObjPath = path.join(".");

  if (typeNameFromJsonObj !== typeNameFromConfigType) {
    errors.push(
      `${jsonObjPath}: Except ${typeNameFromConfigType}, but ${typeNameFromJsonObj}`
    );
    return undefined;
  }

  if (
    typeNameFromConfigType === "string" ||
    typeNameFromConfigType === "number"
  ) {
    return jsonObj;
  }

  if (typeNameFromConfigType === "array") {
    const configTypeElement = (configType as ConfigTypeArray)[0];
    const prevPath = path.concat();
    const prevKey = prevPath.pop();
    const array: any[] = [];
    for (let i = 0; i < jsonObj.length; i++) {
      array[i] = ValidateConfigRecursive(
        jsonObj[i],
        configTypeElement,
        errors,
        prevPath.concat(`${prevKey}[${i}]`)
      );
    }
    return array;
  }

  if (typeNameFromConfigType === "object") {
    const configKeys = Object.keys(configType);
    const dict: any = {};
    for (const key of configKeys) {
      const configElementType = (configType as ConfigTypeDict)[key];
      dict[key] = ValidateConfigRecursive(
        jsonObj[key],
        configElementType,
        errors,
        path.concat(key)
      );
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    for (const key of Object.keys(jsonObj)) {
      if (typeof (configType as ConfigTypeDict)[key] === "undefined") {
        errors.push(`${path.concat(key).join(".")}: Unknown key in config`);
      }
    }
    return dict;
  }
  errors.push(`${jsonObjPath}: InternfalError`);
  return undefined;
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
