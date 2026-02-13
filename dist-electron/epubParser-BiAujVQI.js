import { createRequire } from "node:module";
const require$1 = createRequire(import.meta.url);
const EPub = require$1("epub2");
const parseEpub = (filePath) => {
  console.log("Starting parseEpub for:", filePath);
  return new Promise((resolve, reject) => {
    try {
      const epub = new EPub(filePath);
      epub.on("error", (err) => {
        console.error("EPub library emitted error:", err);
        reject(err);
      });
      epub.on("end", async () => {
        console.log("EPub emitted end");
        try {
          const chapters = [];
          console.log("Flow length:", epub.flow.length);
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
          console.log("Resolving chapters");
          resolve(chapters);
        } catch (error) {
          console.error("Error processing chapters:", error);
          reject(error);
        }
      });
      console.log("Calling epub.parse()");
      epub.parse();
    } catch (err) {
      console.error("Error initializing EPub:", err);
      reject(err);
    }
  });
};
const getChapterText = (epub, chapterId) => {
  return new Promise((resolve, reject) => {
    epub.getChapter(chapterId, (error, text) => {
      if (error) {
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
