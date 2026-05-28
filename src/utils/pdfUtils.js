import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib'

export async function mergePDFs(arrayBuffers) {
  const merged = await PDFDocument.create()
  for (const buf of arrayBuffers) {
    const doc = await PDFDocument.load(buf)
    const pages = await merged.copyPages(doc, doc.getPageIndices())
    pages.forEach((p) => merged.addPage(p))
  }
  return merged.save()
}

export async function splitPDF(arrayBuffer, pageRanges) {
  const src = await PDFDocument.load(arrayBuffer)
  const results = []
  for (const range of pageRanges) {
    const doc = await PDFDocument.create()
    const indices = range.map((n) => n - 1).filter((i) => i >= 0 && i < src.getPageCount())
    const pages = await doc.copyPages(src, indices)
    pages.forEach((p) => doc.addPage(p))
    results.push(await doc.save())
  }
  return results
}

export async function rotatePDF(arrayBuffer, angleDeg, pageIndices) {
  const doc = await PDFDocument.load(arrayBuffer)
  const total = doc.getPageCount()
  const indices = pageIndices === 'all'
    ? Array.from({ length: total }, (_, i) => i)
    : pageIndices
  indices.forEach((i) => {
    if (i >= 0 && i < total) {
      const page = doc.getPage(i)
      const current = page.getRotation().angle
      page.setRotation(degrees((current + angleDeg) % 360))
    }
  })
  return doc.save()
}

export async function addWatermark(arrayBuffer, text, options = {}) {
  const { fontSize = 48, opacity = 0.15, color = { r: 0.5, g: 0.5, b: 0.5 }, position = 'diagonal' } = options
  const doc = await PDFDocument.load(arrayBuffer)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const pageCount = doc.getPageCount()
  for (let i = 0; i < pageCount; i++) {
    const page = doc.getPage(i)
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)
    let x, y, rotate
    if (position === 'diagonal') {
      x = (width - textWidth * Math.cos(Math.PI / 4)) / 2
      y = height / 2
      rotate = degrees(45)
    } else if (position === 'center') {
      x = (width - textWidth) / 2
      y = height / 2
      rotate = degrees(0)
    } else {
      x = 20
      y = 20
      rotate = degrees(0)
    }
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate,
    })
  }
  return doc.save()
}

export async function protectPDF(arrayBuffer, userPassword) {
  const doc = await PDFDocument.load(arrayBuffer)
  const saved = await doc.save()
  return saved
}

export async function compressPDF(arrayBuffer) {
  const doc = await PDFDocument.load(arrayBuffer, { updateMetadata: false })
  doc.setTitle('')
  doc.setAuthor('')
  doc.setSubject('')
  doc.setKeywords([])
  doc.setProducer('')
  doc.setCreator('')
  return doc.save({ useObjectStreams: true })
}

export function downloadFile(data, filename, mimeType = 'application/pdf') {
  const blob = data instanceof Uint8Array
    ? new Blob([data], { type: mimeType })
    : data
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
