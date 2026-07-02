// Resize + re-encode an image file client-side before upload, so large phone
// photos don't get uploaded byte-for-byte to Firebase Storage.
export function compressImage(file, { maxWidth = 1280, maxHeight = 1280, quality = 0.75 } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(1, maxWidth / img.width, maxHeight / img.height)
      const width = Math.round(img.width * ratio)
      const height = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Gagal mengompres gambar.')); return }
        const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
        resolve(new File([blob], name, { type: 'image/jpeg' }))
      }, 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal memuat gambar.')) }
    img.src = url
  })
}
