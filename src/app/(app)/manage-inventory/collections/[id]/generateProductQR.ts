export async function generateProductQR(
  product: { title: string; vendor: string; handle: string },
  baseUrl: string
): Promise<Blob> {
  const url = `${baseUrl}/store/product/${product.handle}`
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo crear el canvas')

  canvas.width = 500
  canvas.height = 600

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = qrApiUrl
  })

  const qrSize = 400
  const qrX = (canvas.width - qrSize) / 2
  const qrY = 30
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'

  ctx.font = 'bold 22px sans-serif'
  const maxTitleWidth = canvas.width - 40
  const title = product.title.length > 40 ? product.title.substring(0, 37) + '...' : product.title
  ctx.fillText(title, canvas.width / 2, qrY + qrSize + 35, maxTitleWidth)

  ctx.font = '18px sans-serif'
  ctx.fillStyle = '#666666'
  const vendor =
    product.vendor.length > 40 ? product.vendor.substring(0, 37) + '...' : product.vendor
  ctx.fillText(vendor, canvas.width / 2, qrY + qrSize + 60, maxTitleWidth)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('No se pudo generar el blob'))
      }
    })
  })
}

export function downloadQRBlob(blob: Blob, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}

