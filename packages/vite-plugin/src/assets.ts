export type AssetType = 'texture' | 'sound'

const TEXTURE_RE = /\.(?:png|jpe?g|webp|svg)(?:\?.*)?$/i
const SOUND_RE = /\.(?:ogg|mp3|wav|opus|m4a)(?:\?.*)?$/i
const FRAXEL_QUERY_RE = /[?&]fraxel(?:&|$)/
const TYPE_QUERY_RE = (type: AssetType) => new RegExp(`[?&]${type}(?:&|$)`)

export function detectFraxelAsset(source: string): AssetType | null {
  if (FRAXEL_QUERY_RE.test(source)) {
    if (TYPE_QUERY_RE('texture').test(source)) return 'texture'
    if (TYPE_QUERY_RE('sound').test(source)) return 'sound'
  }

  if (TEXTURE_RE.test(source)) return 'texture'
  if (SOUND_RE.test(source)) return 'sound'

  return null
}

export function stripFraxelQuery(source: string): string {
  return source.replace(/[?&]fraxel(?:&|$)/, '?').replace(/\?$/, '')
}
