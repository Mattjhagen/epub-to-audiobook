import JSZip from 'jszip';

export interface Chapter {
    id: string;
    title: string;
    content: string; // HTML content or text
}

export interface FileService {
    parseEpub(file: File | string): Promise<Chapter[]>;
}

export class WebFileService implements FileService {
    async parseEpub(file: File | string): Promise<Chapter[]> {
        if (typeof file === 'string') {
            throw new Error("WebFileService expects a File object, not a path string.");
        }

        const zip = await JSZip.loadAsync(file);
        const container = await zip.file("META-INF/container.xml")?.async("string");

        if (!container) throw new Error("Invalid EPUB: META-INF/container.xml not found");

        const parser = new DOMParser();
        const containerDoc = parser.parseFromString(container, "application/xml");
        const rootPath = containerDoc.querySelector("rootfile")?.getAttribute("full-path");

        if (!rootPath) throw new Error("Invalid EPUB: rootfile not found in container.xml");

        const opfContent = await zip.file(rootPath)?.async("string");
        if (!opfContent) throw new Error(`Invalid EPUB: OEBPS root file (${rootPath}) not found`);

        const opfDoc = parser.parseFromString(opfContent, "application/xml");
        const manifest = opfDoc.querySelectorAll("manifest > item");
        const spine = opfDoc.querySelectorAll("spine > itemref");

        const manifestMap = new Map<string, string>();
        manifest.forEach(item => {
            manifestMap.set(item.getAttribute("id")!, item.getAttribute("href")!);
        });

        const chapters: Chapter[] = [];
        const opfFolder = rootPath.substring(0, rootPath.lastIndexOf("/") + 1);

        for (let i = 0; i < spine.length; i++) {
            const itemref = spine[i];
            const idref = itemref.getAttribute("idref");
            if (!idref) continue;

            const href = manifestMap.get(idref);
            if (!href) continue;

            const fullPath = opfFolder + href;
            const fileContent = await zip.file(fullPath)?.async("string");

            if (fileContent) {
                const doc = parser.parseFromString(fileContent, "text/html");
                const title = doc.querySelector("title")?.textContent || `Chapter ${i + 1}`;
                const text = doc.body.innerText || doc.body.textContent || "";

                if (text.trim().length > 0) {
                    chapters.push({
                        id: idref,
                        title: title,
                        content: text.trim().substring(0, 100000)
                    });
                }
            }
        }

        return chapters;
    }
}

export class ElectronFileService implements FileService {
    async parseEpub(file: File | string): Promise<Chapter[]> {
        // In Electron, we expect a file path string from the drag-and-drop or dialog
        let filePath: string;

        if (typeof file === 'string') {
            filePath = file;
        } else {
            // @ts-ignore
            if (file.path) {
                // @ts-ignore
                filePath = file.path;
            } else {
                throw new Error("ElectronFileService: File object missing 'path' property.");
            }
        }

        // Use IPC to call main process
        // @ts-ignore
        return await window.ipcRenderer.invoke('parse-epub', filePath);
    }
}

export function getFileService(): FileService {
    // @ts-ignore
    if (window.ipcRenderer) {
        return new ElectronFileService();
    } else {
        return new WebFileService();
    }
}
