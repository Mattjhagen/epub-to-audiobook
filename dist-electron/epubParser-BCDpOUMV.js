import { createRequire } from "node:module";
const require$1 = createRequire(import.meta.url);
const EPub = require$1("epub2");
const parseEpub = (filePath) => {
  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath);
    epub.on("error", (err) => {
      reject(err);
    });
    epub.on("end", async () => {
      try {
        const chapters = [];
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
        resolve(chapters);
      } catch (error) {
        reject(error);
      }
    });
    epub.parse();
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
