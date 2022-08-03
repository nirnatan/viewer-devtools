import { Storage, useStorage as useFWStorage } from '@plasmohq/storage'
import type { Fleet } from '~types/Store'

export type SerializeStore = {
  clientOnly: boolean
  debug: boolean
  disableHtmlEmbeds: boolean
  disablePlatform: boolean
  editorElementsOverride: string
  experiments: Array<string>
  fleet: Fleet
  forceCache: boolean
  isqa: boolean
  queryParams: Array<string>
  shouldOverrideEditorElements: boolean
  ssrOnly: boolean
  suppressBI: boolean
  version: string
}

export interface IStorage extends SerializeStore {
  selectedPreset: string
  presets: Record<string, SerializeStore>
  autoUpdateFromUrl: boolean
  githubPrivateToken: string
  proxy: boolean
  tabId: number
}

export class ExtensionStorage {
  #storage: Storage
  constructor() {
    this.#storage = new Storage()
  }

  async get<T extends keyof IStorage>(key: T) {
    const value = await this.#storage.get<IStorage[T]>(key)
    return value
  }

  async set<T extends keyof IStorage>(key: T, value: IStorage[T]) {
    await this.#storage.set(key, value)
  }

  async serialize(): Promise<SerializeStore> {
    return {
      debug: await this.get('debug'),
      disableHtmlEmbeds: await this.get('disableHtmlEmbeds'),
      disablePlatform: await this.get('disablePlatform'),
      ssrOnly: await this.get('ssrOnly'),
      fleet: await this.get('fleet'),
      editorElementsOverride: await this.get('editorElementsOverride'),
      shouldOverrideEditorElements: await this.get('shouldOverrideEditorElements'),
      experiments: await this.get('experiments'),
      clientOnly: await this.get('clientOnly'),
      isqa: await this.get('isqa'),
      queryParams: await this.get('queryParams'),
      forceCache: await this.get('forceCache'),
      suppressBI: await this.get('suppressBI'),
      version: await this.get('version'),
    }
  }

  deserialize(data: SerializeStore) {
    Object.entries(data).forEach(([key, value]: [keyof SerializeStore, any]) => {
      this.set(key, value)
    })
  }

  async addPreset(name?: string) {
    const presets = (await this.get('presets')) ?? {}
    if (!name) {
      name = `Preset ${Object.keys(presets).length + 1}`
    }
    this.set('presets', { ...presets, [name]: await this.serialize() })
  }

  async removePreset(name: string) {
    const presets = (await this.get('presets')) ?? {}
    const { [name]: removed, ...rest } = presets
    this.set('presets', rest)
  }
}

export type StorageKeys = keyof IStorage

export const useStorage = <T extends keyof IStorage, Value = IStorage[T]>(key: T, value: Value) =>
  useFWStorage(key, value)
