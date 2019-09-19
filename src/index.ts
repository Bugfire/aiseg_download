/**
 * @license aiseg_download v0.1
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as fs from "fs";
import * as cron from "cron";
import * as http from "http";
import * as path from "path";
import * as stream from "stream";
import * as unzipper from "unzipper";

if (process.argv.length <= 2) {
  throw new Error("Invalid argument. Specify top directory of config.");
}
const DATA_DIR = `${process.argv[2]}data`;
const CONFIG = JSON.parse(
  fs.readFileSync(`${process.argv[2]}config/config.json`, "utf8")
);
const HOST = CONFIG.aiseg.host;
const PORT = CONFIG.aiseg.port;
const AUTH = CONFIG.aiseg.auth;

const createEmptyTransform = (): stream.Transform => {
  return new stream.Transform({
    transform(chunk, encoding, callback): void {
      callback(null, chunk);
    }
  });
};

const fetch = async (path: string): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject): void => {
    const req = http.get(
      {
        host: HOST,
        port: PORT,
        path: path,
        auth: AUTH
      },
      res => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Status = ${res.statusCode}`));
        }
        const buftrans = createEmptyTransform();
        res.pipe(buftrans);
        const data: Buffer[] = [];
        buftrans.on("data", chunk => data.push(chunk));
        buftrans.on("end", () => {
          //console.log('fetch ' + path + ' done');
          resolve(Buffer.concat(data));
        });
      }
    );
    req.on("error", reject);
  });
};

const unpack = async (data: Buffer): Promise<{ [key: string]: Buffer }> => {
  return new Promise<{ [key: string]: Buffer }>((resolve, reject): void => {
    const results: { [key: string]: Buffer } = {};
    const readableStreamBuffer = new stream.Readable();
    readableStreamBuffer.push(data);
    readableStreamBuffer.push(null);
    readableStreamBuffer
      .pipe(unzipper.Parse())
      .on("entry", entry => {
        if (entry.type !== "File") {
          entry.autodrain();
          return;
        }
        const buftrans = createEmptyTransform();
        entry.pipe(buftrans);
        const data: Buffer[] = [];
        buftrans.on("data", chunk => data.push(chunk));
        buftrans.on("end", () => {
          results[path.basename(entry.path)] = Buffer.concat(data);
        });
      })
      .on("warning", err => {
        reject(err);
      })
      .on("error", err => {
        reject(err);
      })
      .on("close", () => {
        resolve(results);
      });
  });
};

const wait = async (sleepMs: number): Promise<void> => {
  return new Promise<void>((resolve): void => {
    setTimeout(resolve, sleepMs);
  });
};

const run = async (): Promise<void> => {
  const topResult = await fetch("/set/exectop2.cgi");
  const topMatch = topResult.toString().match(/NAME="csrftoken" VALUE="(\d+)"/);
  if (topMatch === null || topMatch.length <= 1) {
    throw new Error("Invalid response");
  }
  await wait(1000);
  const csrfToken = topMatch[1];
  const zipResult = await fetch(
    `/set/exectop2.cgi?downType=1&csrftoken=${csrfToken}`
  );
  const files = await unpack(zipResult);

  let numWroteFiles = 0;
  Object.keys(files).forEach(filename => {
    if (path.extname(filename) !== ".csv") {
      return;
    }
    const fileMatch = filename.match(/^(.+)_[0-9]+.csv$/);
    let localFilename = `${DATA_DIR}/${filename}`;
    if (fileMatch !== null && fileMatch.length > 1) {
      const dataDir = `${DATA_DIR}/${fileMatch[1]}`;
      if (fs.existsSync(dataDir) === false) {
        fs.mkdirSync(dataDir);
      }
      localFilename = `${dataDir}/${filename}`;
    }
    let writeFile = false;
    if (fs.existsSync(localFilename)) {
      const oldFile = fs.readFileSync(localFilename);
      if (Buffer.compare(oldFile, files[filename]) !== 0) {
        writeFile = true;
      }
    } else {
      writeFile = true;
    }
    if (writeFile) {
      numWroteFiles++;
      fs.writeFileSync(localFilename, files[filename]);
    }
  });

  const dateStr = new Date()
    .toISOString()
    .replace("T", ".")
    .split(".")
    .slice(0, 2)
    .join(" ");
  console.log(`${dateStr}: Wrote ${numWroteFiles} files`);
};

const wrappedRun = async (): Promise<void> => {
  try {
    await run();
  } catch (ex) {
    console.error(ex);
  }
};

const kick = async (): Promise<void> => {
  await wrappedRun();
  new cron.CronJob("0 0 4 * * *", wrappedRun, null, true);
};

kick();
