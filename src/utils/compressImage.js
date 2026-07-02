// Compress an image client-side and return it as a base64 data URL. Photos
// are stored directly in Firestore document fields (no Firebase Storage, to
// avoid requiring a paid Blaze plan), so the encoded result must stay well
// under Firestore's 1 MiB per-document limit.
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal memuat gambar.')) }
    img.src = url
  })
}

function drawToDataUrl(img, maxWidth, maxHeight, quality) {
  const ratio = Math.min(1, maxWidth / img.width, maxHeight / img.height)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * ratio)
  canvas.height = Math.round(img.height * ratio)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

export async function compressImageToDataUrl(file, { maxWidth = 1000, maxHeight = 1000, quality = 0.7, maxBytes = 700 * 1024 } = {}) {
  const img = await loadImage(file)
  let width = maxWidth, height = maxHeight, q = quality
  let dataUrl = drawToDataUrl(img, width, height, q)
  for (let i = 0; i < 6 && dataUrl.length > maxBytes; i++) {
    q = Math.max(0.3, q - 0.12)
    width = Math.round(width * 0.85)
    height = Math.round(height * 0.85)
    dataUrl = drawToDataUrl(img, width, height, q)
  }
  if (dataUrl.length > maxBytes) {
    throw new Error('Foto terlalu berat untuk disimpan. Coba foto lain atau resolusi lebih kecil.')
  }
  return dataUrl
}
