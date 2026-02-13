export interface ParsedChapter {
  id: string
  title: string
  text: string
}

interface ManifestItem {
  href: string
  mediaType: string
}

export async function parseEpubInBrowser(file: File): Promise<ParsedChapter[]> {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(await file.arrayBuffer())

  const containerPath = 'META-INF/container.xml'
  const containerXml = await readZipText(zip, containerPath)
  if (!containerXml) {
    throw new Error(`Invalid EPUB: missing ${containerPath}`)
  }

  const containerDoc = parseXml(containerXml, 'application/xml')
  const rootFilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path')
  if (!rootFilePath) {
    throw new Error('Invalid EPUB: missing OPF path in container.xml')
  }

  const opfXml = await readZipText(zip, rootFilePath)
  if (!opfXml) {
    throw new Error(`Invalid EPUB: missing OPF file at ${rootFilePath}`)
  }

  const opfDoc = parseXml(opfXml, 'application/xml')
  const manifest = buildManifest(opfDoc)
  const spineItemIds = Array.from(opfDoc.querySelectorAll('spine itemref'))
    .map((node) => node.getAttribute('idref'))
    .filter((id): id is string => Boolean(id))

  const opfDir = dirname(rootFilePath)
  const chapters: ParsedChapter[] = []

  for (let i = 0; i < spineItemIds.length; i += 1) {
    const itemId = spineItemIds[i]
    const item = manifest.get(itemId)
    if (!item) continue

    const isTextChapter = item.mediaType.includes('xhtml') || item.mediaType.includes('html')
    if (!isTextChapter) continue

    const chapterPath = normalizeZipPath(opfDir, item.href)
    const chapterXml = await readZipText(zip, chapterPath)
    if (!chapterXml) continue

    const chapterDoc = parseXml(chapterXml, 'application/xhtml+xml')
    const title =
      chapterDoc.querySelector('title')?.textContent?.trim() ||
      chapterDoc.querySelector('h1,h2,h3')?.textContent?.trim() ||
      `Chapter ${chapters.length + 1}`

    const text = (chapterDoc.querySelector('body')?.textContent || chapterDoc.documentElement?.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!text) continue

    chapters.push({
      id: itemId || `chapter-${i + 1}`,
      title,
      text,
    })
  }

  return chapters
}

async function readZipText(zip: any, filePath: string): Promise<string | null> {
  const file = zip.file(filePath)
  if (!file) return null
  return file.async('string')
}

function parseXml(xml: string, mimeType: DOMParserSupportedType): Document {
  const doc = new DOMParser().parseFromString(xml, mimeType)
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error(`Failed to parse XML: ${parserError.textContent || 'unknown parser error'}`)
  }
  return doc
}

function buildManifest(opfDoc: Document): Map<string, ManifestItem> {
  const map = new Map<string, ManifestItem>()
  const items = Array.from(opfDoc.querySelectorAll('manifest item'))

  for (const node of items) {
    const id = node.getAttribute('id')
    const href = node.getAttribute('href')
    const mediaType = node.getAttribute('media-type') || ''
    if (!id || !href) continue
    map.set(id, { href, mediaType })
  }

  return map
}

function dirname(pathValue: string): string {
  const idx = pathValue.lastIndexOf('/')
  return idx >= 0 ? pathValue.slice(0, idx) : ''
}

function normalizeZipPath(baseDir: string, relativePath: string): string {
  const raw = baseDir ? `${baseDir}/${relativePath}` : relativePath
  const parts = raw.split('/')
  const normalized: string[] = []

  for (const part of parts) {
    if (!part || part === '.') continue
    if (part === '..') {
      normalized.pop()
      continue
    }
    normalized.push(part)
  }

  return normalized.join('/')
}
