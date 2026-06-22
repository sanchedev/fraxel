import { TinyEngineError } from './base.js'

export class AssetError extends TinyEngineError {
  constructor(message: string) {
    super(message)
    this.name = 'AssetError'
  }
}

export class TextureNotFoundError extends AssetError {
  constructor(id: string) {
    super(`Texture "${id}" does not exist`)
  }
}
