import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export async function pdfToImages(arrayBuffer, format = 'png', quality = 0.92, onProgress) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdf.numPages
  const blobs = []
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    await page.render({ canvasContext: ctx, viewport }).promise
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality))
    blobs.push({ blob, page: i })
    if (onProgress) onProgress(Math.round((i / numPages) * 100))
  }
  return blobs
}

export async function imagesToPDF(files, pageSize = 'A4') {
  const doc = await PDFDocument.create()
  const sizes = {
    A4: [595.28, 841.89],
    Letter: [612, 792],
    fit: null,
  }
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    const mime = file.type
    let image
    if (mime === 'image/jpeg' || mime === 'image/jpg') {
      image = await doc.embedJpg(arrayBuffer)
    } else if (mime === 'image/png') {
      image = await doc.embedPng(arrayBuffer)
    } else {
      const canvas = document.createElement('canvas')
      const img = await new Promise((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = reject
        el.src = URL.createObjectURL(file)
      })
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
      const jpgArrayBuffer = await new Promise((resolve) => {
        canvas.toBlob((blob) => blob.arrayBuffer().then(resolve), 'image/jpeg', 0.95)
      })
      image = await doc.embedJpg(jpgArrayBuffer)
    }
    const dims = sizes[pageSize]
    let pw, ph
    if (!dims) {
      pw = image.width
      ph = image.height
    } else {
      pw = dims[0]
      ph = dims[1]
    }
    const page = doc.addPage([pw, ph])
    const scale = Math.min(pw / image.width, ph / image.height)
    const w = image.width * scale
    const h = image.height * scale
    page.drawImage(image, {
      x: (pw - w) / 2,
      y: (ph - h) / 2,
      width: w,
      height: h,
    })
  }
  return doc.save()
}

export async function renderPDFPreview(arrayBuffer, pageNum = 1, scale = 1) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  await page.render({ canvasContext: ctx, viewport }).promise
  return { canvas, numPages: pdf.numPages }
}
