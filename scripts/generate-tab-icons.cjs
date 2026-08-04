/**
 * 生成 TabBar 图标 PNG 文件
 * 使用纯 Node.js Buffer 生成最小 PNG
 * 微信小程序 tabBar 推荐 81x81 px
 */
const fs = require('fs')
const path = require('path')

const SIZE = 81
const OUTPUT_DIR = path.join(__dirname, '..', 'miniprogram', 'images')

// 简单的 PNG 生成器（单通道灰度 + 透明）
// 使用未压缩的 PNG（IDAT 使用 store/no compression）
function createPNG(width, height, drawFn, color) {
  const r = (color >> 16) & 0xff
  const g = (color >> 8) & 0xff
  const b = color & 0xff

  // 创建像素数据 (RGBA)
  const pixels = new Uint8Array(width * height * 4)
  
  // 绘制
  drawFn(pixels, width, height, r, g, b)

  // 构建 PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  
  // IHDR
  const ihdr = Buffer.alloc(25)
  ihdr.writeUInt32BE(13, 0) // length
  ihdr.write('IHDR', 4)
  ihdr.writeUInt32BE(width, 8)
  ihdr.writeUInt32BE(height, 12)
  ihdr[16] = 8  // bit depth
  ihdr[17] = 6  // color type: RGBA
  ihdr[18] = 0  // compression
  ihdr[19] = 0  // filter
  ihdr[20] = 0  // interlace
  const ihdrCrc = crc32(ihdr.slice(4, 21))
  ihdr.writeInt32BE(ihdrCrc, 21)

  // IDAT - 每行前加filter byte(0 = None)
  const rawData = []
  for (let y = 0; y < height; y++) {
    rawData.push(0) // filter: none
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      rawData.push(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3])
    }
  }

  // zlib deflate (store mode - no compression)
  const rawBuf = Buffer.from(rawData)
  const deflated = zlibStore(rawBuf)
  
  const idatDataLen = deflated.length
  const idat = Buffer.alloc(idatDataLen + 12)
  idat.writeUInt32BE(idatDataLen, 0)
  idat.write('IDAT', 4)
  deflated.copy(idat, 8)
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), deflated]))
  idat.writeInt32BE(idatCrc, idatDataLen + 8)

  // IEND
  const iend = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 0xAE, 0x42, 0x60, 0x82])

  return Buffer.concat([signature, ihdr, idat, iend])
}

// zlib store (无压缩) - 输出 zlib 格式
function zlibStore(data) {
  const maxBlock = 65535
  const numBlocks = Math.ceil(data.length / maxBlock)
  const parts = [Buffer.from([0x78, 0x01])] // zlib header (deflate, no compression)
  
  for (let i = 0; i < numBlocks; i++) {
    const start = i * maxBlock
    const end = Math.min(start + maxBlock, data.length)
    const block = data.slice(start, end)
    const isLast = (i === numBlocks - 1)
    
    const header = Buffer.alloc(5)
    header[0] = isLast ? 1 : 0
    header.writeUInt16LE(block.length, 1)
    header.writeUInt16LE(block.length ^ 0xffff, 3)
    
    parts.push(header, block)
  }

  // Adler32 checksum
  const adler = adler32(data)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(adler >>> 0, 0)
  parts.push(checksum)
  
  return Buffer.concat(parts)
}

// CRC32
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = crc32Table[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) | 0
}

const crc32Table = new Int32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  }
  crc32Table[i] = c
}

// Adler32
function adler32(buf) {
  let a = 1, b = 0
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521
    b = (b + a) % 65521
  }
  return (b << 16) | a
}

// 辅助绘制函数
function setPixel(pixels, w, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= w || y < 0 || y >= w) return
  x = Math.floor(x)
  y = Math.floor(y)
  const idx = (y * w + x) * 4
  // Alpha blending
  const srcA = a / 255
  const dstA = pixels[idx + 3] / 255
  const outA = srcA + dstA * (1 - srcA)
  if (outA > 0) {
    pixels[idx] = Math.round((r * srcA + pixels[idx] * dstA * (1 - srcA)) / outA)
    pixels[idx + 1] = Math.round((g * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA)
    pixels[idx + 2] = Math.round((b * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA)
    pixels[idx + 3] = Math.round(outA * 255)
  }
}

function drawLine(pixels, w, h, x0, y0, x1, y1, r, g, b, thickness = 3) {
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.sqrt(dx * dx + dy * dy)
  const steps = Math.ceil(len * 2)
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const cx = x0 + dx * t
    const cy = y0 + dy * t
    
    for (let ox = -thickness / 2; ox <= thickness / 2; ox++) {
      for (let oy = -thickness / 2; oy <= thickness / 2; oy++) {
        if (ox * ox + oy * oy <= (thickness / 2) * (thickness / 2)) {
          setPixel(pixels, w, Math.round(cx + ox), Math.round(cy + oy), r, g, b)
        }
      }
    }
  }
}

function drawCircle(pixels, w, h, cx, cy, radius, r, g, b, thickness = 3, fill = false) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      if (fill) {
        if (dist <= radius) {
          setPixel(pixels, w, x, y, r, g, b)
        }
      } else {
        if (Math.abs(dist - radius) <= thickness / 2) {
          setPixel(pixels, w, x, y, r, g, b)
        }
      }
    }
  }
}

function drawRect(pixels, w, h, x0, y0, x1, y1, r, g, b, thickness = 3, radius = 0) {
  // 简单矩形框（带圆角支持）
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      // 检查是否在边框上
      const onLeft = Math.abs(x - x0) < thickness
      const onRight = Math.abs(x - x1) < thickness
      const onTop = Math.abs(y - y0) < thickness
      const onBottom = Math.abs(y - y1) < thickness
      
      if (onLeft || onRight || onTop || onBottom) {
        // 圆角裁剪
        if (radius > 0) {
          const corners = [
            [x0 + radius, y0 + radius],
            [x1 - radius, y0 + radius],
            [x0 + radius, y1 - radius],
            [x1 - radius, y1 - radius]
          ]
          let inCorner = false
          for (const [ccx, ccy] of corners) {
            if ((x < x0 + radius || x > x1 - radius) && (y < y0 + radius || y > y1 - radius)) {
              const d = Math.sqrt((x - ccx) ** 2 + (y - ccy) ** 2)
              if (d > radius) {
                inCorner = true
                break
              }
            }
          }
          if (inCorner) continue
        }
        setPixel(pixels, w, x, y, r, g, b)
      }
    }
  }
}

// ====== 图标绘制函数 ======

// 首页图标：小房子
function drawHome(pixels, w, h, r, g, b) {
  const cx = w / 2
  const t = 3.5
  // 屋顶（三角形）
  const roofTop = 16
  const roofBottom = 38
  const roofLeft = 12
  const roofRight = w - 12
  drawLine(pixels, w, h, cx, roofTop, roofLeft, roofBottom, r, g, b, t)
  drawLine(pixels, w, h, cx, roofTop, roofRight, roofBottom, r, g, b, t)
  // 房身
  const bodyLeft = 20
  const bodyRight = w - 20
  const bodyTop = roofBottom - 2
  const bodyBottom = h - 16
  drawLine(pixels, w, h, bodyLeft, bodyTop, bodyLeft, bodyBottom, r, g, b, t)
  drawLine(pixels, w, h, bodyRight, bodyTop, bodyRight, bodyBottom, r, g, b, t)
  drawLine(pixels, w, h, bodyLeft, bodyBottom, bodyRight, bodyBottom, r, g, b, t)
  // 门
  const doorLeft = cx - 8
  const doorRight = cx + 8
  const doorTop = bodyBottom - 22
  drawLine(pixels, w, h, doorLeft, doorTop, doorRight, doorTop, r, g, b, t - 1)
  drawLine(pixels, w, h, doorLeft, doorTop, doorLeft, bodyBottom, r, g, b, t - 1)
  drawLine(pixels, w, h, doorRight, doorTop, doorRight, bodyBottom, r, g, b, t - 1)
}

// 发现图标：指南针/罗盘
function drawDiscover(pixels, w, h, r, g, b) {
  const cx = w / 2
  const cy = h / 2
  // 外圆
  drawCircle(pixels, w, h, cx, cy, 30, r, g, b, 3.5)
  // 指针（菱形）
  const t = 2.5
  drawLine(pixels, w, h, cx, cy - 20, cx + 8, cy, r, g, b, t)
  drawLine(pixels, w, h, cx + 8, cy, cx, cy + 20, r, g, b, t)
  drawLine(pixels, w, h, cx, cy + 20, cx - 8, cy, r, g, b, t)
  drawLine(pixels, w, h, cx - 8, cy, cx, cy - 20, r, g, b, t)
  // 中心点
  drawCircle(pixels, w, h, cx, cy, 3, r, g, b, 3, true)
  // 刻度点
  const dotR = 2
  drawCircle(pixels, w, h, cx, cy - 27, dotR, r, g, b, dotR, true) // 北
  drawCircle(pixels, w, h, cx + 27, cy, dotR, r, g, b, dotR, true) // 东
  drawCircle(pixels, w, h, cx, cy + 27, dotR, r, g, b, dotR, true) // 南
  drawCircle(pixels, w, h, cx - 27, cy, dotR, r, g, b, dotR, true) // 西
}

// 发布图标：圆圈内加号
function drawPublish(pixels, w, h, r, g, b) {
  const cx = w / 2
  const cy = h / 2
  const t = 3.5
  drawCircle(pixels, w, h, cx, cy, 28, r, g, b, t)
  drawLine(pixels, w, h, cx, cy - 14, cx, cy + 14, r, g, b, t)
  drawLine(pixels, w, h, cx - 14, cy, cx + 14, cy, r, g, b, t)
}

// 我的图标：用户头像轮廓
function drawProfile(pixels, w, h, r, g, b) {
  const cx = w / 2
  const t = 3.5
  drawCircle(pixels, w, h, cx, 27, 13, r, g, b, t)
  // 肩部弧线
  for (let angle = 0.15; angle <= Math.PI - 0.15; angle += 0.02) {
    const radius = 27
    const bx = cx + Math.cos(angle + Math.PI) * radius
    const by = 54 + Math.sin(angle + Math.PI) * radius * 0.72
    for (let ox = -t / 2; ox <= t / 2; ox++) {
      for (let oy = -t / 2; oy <= t / 2; oy++) {
        if (ox * ox + oy * oy <= (t / 2) * (t / 2)) {
          setPixel(pixels, w, Math.round(bx + ox), Math.round(by + oy), r, g, b)
        }
      }
    }
  }
}

// 生成所有图标
const icons = [
  { name: 'tab-home', draw: drawHome },
  { name: 'tab-discover', draw: drawDiscover },
  { name: 'tab-publish', draw: drawPublish },
  { name: 'tab-profile', draw: drawProfile }
]

const NORMAL_COLOR = 0x94a3b8  // #94a3b8 灰色
const ACTIVE_COLOR = 0x6366f1  // #6366f1 主题紫

icons.forEach(({ name, draw }) => {
  // 普通态
  const normalPng = createPNG(SIZE, SIZE, draw, NORMAL_COLOR)
  fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.png`), normalPng)
  
  // 选中态
  const activePng = createPNG(SIZE, SIZE, draw, ACTIVE_COLOR)
  fs.writeFileSync(path.join(OUTPUT_DIR, `${name}-active.png`), activePng)
  
  console.log(`✅ Generated: ${name}.png + ${name}-active.png`)
})

console.log('\n🎉 All tab icons generated!')
