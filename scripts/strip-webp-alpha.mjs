#!/usr/bin/env node
// Quita el canal alfa de un WebP con pérdida sin recodificarlo. El color va en el trozo «VP8 » y el alfa en
// otro aparte, «ALPH»: basta con reescribir el contenedor sin él, y el color queda byte a byte como estaba.
// Es para fotos opacas que el programa de exportación guarda con un alfa que no se ve (y que llega a pesar
// un 40 % del archivo). Las que necesitan transparencia no se pasan por aquí: tests/unit/images.test.ts
// lleva la lista.
// Uso: node scripts/strip-webp-alpha.mjs <archivo.webp>...   (sobrescribe cada archivo)
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/** Los trozos del contenedor de un WebP, en orden: su nombre de cuatro letras y su contenido. */
export function webpChunks (buf) {
  if (buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WEBP') throw new Error('no es un WebP')
  const chunks = []
  for (let at = 12; at + 8 <= buf.length;) {
    const size = buf.readUInt32LE(at + 4)
    chunks.push({ id: buf.toString('latin1', at, at + 4), payload: buf.subarray(at + 8, at + 8 + size) })
    at += 8 + size + (size % 2) // un trozo de tamaño impar lleva un byte de relleno
  }
  return chunks
}

/** El mismo WebP sin su canal alfa, o null si no lo lleva. */
export function stripAlpha (buf) {
  const chunks = webpChunks(buf)
  if (!chunks.some((c) => c.id === 'ALPH')) return null
  if (!chunks.some((c) => c.id === 'VP8 ')) throw new Error('no lleva imagen con pérdida («VP8 »): el alfa no se puede separar')
  let kept = chunks.filter((c) => c.id !== 'ALPH')
  // Sin alfa, sin perfil de color y sin metadatos sobra la cabecera extendida: queda el formato simple.
  if (kept.every((c) => c.id === 'VP8X' || c.id === 'VP8 ')) kept = kept.filter((c) => c.id === 'VP8 ')

  const parts = []
  for (const { id, payload } of kept) {
    const header = Buffer.alloc(8)
    header.write(id, 0, 'latin1')
    header.writeUInt32LE(payload.length, 4)
    const content = Buffer.from(payload)
    if (id === 'VP8X') content[0] &= ~0x10 // apaga el indicador de alfa
    parts.push(header, content, Buffer.alloc(payload.length % 2))
  }
  const body = Buffer.concat(parts)
  const head = Buffer.alloc(12)
  head.write('RIFF', 0, 'latin1')
  head.writeUInt32LE(4 + body.length, 4)
  head.write('WEBP', 8, 'latin1')
  return Buffer.concat([head, body])
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let saved = 0
  for (const file of process.argv.slice(2)) {
    const before = readFileSync(file)
    const after = stripAlpha(before)
    if (after == null) { console.log(`${file}: no lleva canal alfa`); continue }
    writeFileSync(file, after)
    saved += before.length - after.length
    console.log(`${file}: ${(before.length / 1000).toFixed(1)} → ${(after.length / 1000).toFixed(1)} kB`)
  }
  console.log(`\nTotal: −${(saved / 1000).toFixed(1)} kB`)
}
