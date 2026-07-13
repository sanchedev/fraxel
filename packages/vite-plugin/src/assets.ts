export type AssetType = 'texture' | 'sound'

const TEXTURE_QUERY_RE = /[?&]texture(?:&|$)/
const SOUND_QUERY_RE = /[?&]sound(?:&|$)/

export function detectFraxelAsset(source: string): AssetType | null {
  if (TEXTURE_QUERY_RE.test(source)) return 'texture'
  if (SOUND_QUERY_RE.test(source)) return 'sound'
  return null
}

export function stripAssetQuery(source: string): string {
  return source
    .replace(/[?&]texture(?:&|$)/, '?')
    .replace(/[?&]sound(?:&|$)/, '?')
    .replace(/\?$/, '')
}
