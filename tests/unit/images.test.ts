import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { stripAlpha, webpChunks } from '../../scripts/strip-webp-alpha.mjs'

type Chunk = [id: string, payload: number[]]

/** Un WebP de mentira: la cabecera RIFF y los trozos que se le pidan, con su relleno si miden impar. */
function webp (...chunks: Chunk[]): Buffer {
  const body = Buffer.concat(chunks.flatMap(([id, payload]) => {
    const header = Buffer.alloc(8)
    header.write(id, 0, 'latin1')
    header.writeUInt32LE(payload.length, 4)
    return [header, Buffer.from(payload), Buffer.alloc(payload.length % 2)]
  }))
  const head = Buffer.alloc(12)
  head.write('RIFF', 0, 'latin1')
  head.writeUInt32LE(4 + body.length, 4)
  head.write('WEBP', 8, 'latin1')
  return Buffer.concat([head, body])
}

const ALPHA_FLAG = 0x10
const ICC_FLAG = 0x20
const extendedHeader = (flags: number): Chunk => ['VP8X', [flags, 0, 0, 0, 9, 0, 0, 9, 0, 0]]
const COLOR: Chunk = ['VP8 ', [1, 2, 3, 4, 5, 6, 7]]
const ALPHA: Chunk = ['ALPH', [9, 9, 9]]
const names = (buf: Buffer): string[] => webpChunks(buf).map((chunk) => chunk.id)

describe('stripAlpha', () => {
  it('deja solo el trozo de color cuando el archivo no lleva nada más', () => {
    const stripped = stripAlpha(webp(extendedHeader(ALPHA_FLAG), ALPHA, COLOR))

    expect(stripped).toEqual(webp(COLOR))
  })

  it('conserva el perfil de color y apaga el indicador de alfa', () => {
    const profile: Chunk = ['ICCP', [7, 7, 7, 7]]

    const stripped = stripAlpha(webp(extendedHeader(ALPHA_FLAG | ICC_FLAG), profile, ALPHA, COLOR))

    expect(stripped).toEqual(webp(extendedHeader(ICC_FLAG), profile, COLOR))
  })

  it('devuelve null si el archivo no lleva canal alfa', () => {
    expect(stripAlpha(webp(COLOR))).toBeNull()
  })

  it('no toca un archivo sin pérdida, donde el alfa va dentro de la imagen', () => {
    expect(stripAlpha(webp(['VP8L', [1, 2, 3, 4]]))).toBeNull()
  })

  it('rechaza lo que no es un WebP', () => {
    expect(() => stripAlpha(Buffer.from('esto no es una imagen'))).toThrow('no es un WebP')
  })
})

describe('fotos de public/assets/img', () => {
  const ROOT = 'public/assets/img'
  // Las únicas que necesitan transparencia: los logotipos, que se usan como máscara, y los dos platos
  // recortados sobre fondo transparente. Si llega otra foto recortada, se añade aquí.
  const NEEDS_TRANSPARENCY = [/(^|\/)logo-/, /brioche-tostado-tobico-casa-guell/, /mar-y-montana-casa-guell/]

  const filesIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? filesIn(file) : [file]
  })
  const webpFiles = filesIn(ROOT).filter((file) => file.endsWith('.webp'))

  // El programa con el que se exportan guarda un canal alfa aunque la foto sea opaca. No se ve, y pesa
  // entre un 3 % y un 40 % del archivo. Se quita con `node scripts/strip-webp-alpha.mjs <archivo>`.
  it('solo llevan canal alfa las que necesitan transparencia', () => {
    const withAlpha = webpFiles
      .filter((file) => names(readFileSync(file)).includes('ALPH'))
      .map((file) => path.relative(ROOT, file).replaceAll('\\', '/'))

    expect(withAlpha.filter((file) => !NEEDS_TRANSPARENCY.some((pattern) => pattern.test(file)))).toEqual([])
  })
})
