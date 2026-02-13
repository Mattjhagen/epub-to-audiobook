import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require$1 = createRequire(import.meta.url);
const EPubModule = require$1("epub2");
const EPub = EPubModule.EPub || EPubModule.default || EPubModule;
path.dirname(new URL(import.meta.url).pathname);
const logPath = path.join(process.cwd(), "debug.log");
const log = (message) => {
  try {
    fs.appendFileSync(logPath, `${(/* @__PURE__ */ new Date()).toISOString()} - ${message}
`);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
};
const parseEpub = (filePath) => {
  log(`Starting parseEpub for: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    log(`File does not exist: ${filePath}`);
    return Promise.reject(new Error(`File not found: ${filePath}`));
  }
  return new Promise((resolve, reject) => {
    try {
      const epub = new EPub(filePath);
      epub.on("error", (err) => {
        log(`EPub library emitted error: ${err}`);
        if (err instanceof Error) {
          log(`Stack: ${err.stack}`);
        }
        reject(err);
      });
      epub.on("end", async () => {
        log("EPub emitted end");
        try {
          const chapters = [];
          log(`Flow length: ${epub.flow ? epub.flow.length : "undefined"}`);
          if (!epub.flow) {
            log("epub.flow is undefined!");
            resolve([]);
            return;
          }
          for (const chapter of epub.flow) {
            const text = await getChapterText(epub, chapter.id);
            if (text && text.trim().length > 0) {
              chapters.push({
                id: chapter.id,
                title: chapter.title || "Untitled Chapter",
                text
              });
            }
          }
          log(`Resolving ${chapters.length} chapters`);
          resolve(chapters);
        } catch (error) {
          log(`Error processing chapters: ${error}`);
          reject(error);
        }
      });
      log("Calling epub.parse()");
      epub.parse();
    } catch (err) {
      log(`Error initializing EPub: ${err}`);
      reject(err);
    }
  });
};
const getChapterText = (epub, chapterId) => {
  return new Promise((resolve, reject) => {
    epub.getChapter(chapterId, (error, text) => {
      if (error) {
        log(`Error getting chapter ${chapterId}: ${error}`);
        reject(error);
        return;
      }
      const plainText = text.replace(/<[^>]+>/g, "\n").replace(/\s+/g, " ").trim();
      resolve(plainText);
    });
  });
};
export {
  parseEpub
};
