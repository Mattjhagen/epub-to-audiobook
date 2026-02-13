import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const EPubModule = require('epub2');
// Handle different export structures (CommonJS vs ESM interop)
const EPub = EPubModule.EPub || EPubModule.default || EPubModule;

// @ts-ignore
const __dirname = path.dirname(new URL(import.meta.url).pathname);
// Use a fixed path in tmp or user home to avoid permission issues if possible, 
// but current directory should be fine in dev.
const logPath = path.join(process.cwd(), 'debug.log');

const log = (message: string) => {
  try {
    fs.appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
  } catch (e) {
    // Fallback to console if file write fails specifically
    console.error('Failed to write to log file:', e);
  }
};

export interface ParsedChapter {
  id: string;
  title: string;
  text: string;
}

export const parseEpub = (filePath: string): Promise<ParsedChapter[]> => {
  log(`Starting parseEpub for: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    log(`File does not exist: ${filePath}`);
    return Promise.reject(new Error(`File not found: ${filePath}`));
  }

  return new Promise((resolve, reject) => {
    try {
      const epub = new EPub(filePath);

      epub.on('error', (err: any) => {
        log(`EPub library emitted error: ${err}`);
        if (err instanceof Error) {
          log(`Stack: ${err.stack}`);
        }
        reject(err);
      });

      epub.on('end', async () => {
        log('EPub emitted end');
        try {
          const chapters: ParsedChapter[] = [];
          // epub.flow is an array of chapter metadata
          log(`Flow length: ${epub.flow ? epub.flow.length : 'undefined'}`);

          if (!epub.flow) {
            log('epub.flow is undefined!');
            resolve([]);
            return;
          }

          for (const chapter of epub.flow) {
            // chapter: { id, title, order, href }
            // We need to get the text content.
            const text = await getChapterText(epub, chapter.id);
            if (text && text.trim().length > 0) {
              chapters.push({
                id: chapter.id,
                title: chapter.title || 'Untitled Chapter',
                text: text
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

      log('Calling epub.parse()');
      epub.parse();
    } catch (err) {
      log(`Error initializing EPub: ${err}`);
      reject(err);
    }
  });
};

const getChapterText = (epub: any, chapterId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    epub.getChapter(chapterId, (error: any, text: string) => {
      if (error) {
        log(`Error getting chapter ${chapterId}: ${error}`);
        reject(error);
        return;
      }
      // Strip HTML tags
      const plainText = text.replace(/<[^>]+>/g, '\n').replace(/\s+/g, ' ').trim();
      resolve(plainText);
    });
  });
};
