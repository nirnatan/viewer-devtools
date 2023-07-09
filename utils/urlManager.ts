import type { Fleet } from '~types/Store'
import { ExtensionStorage, IStorage, SerializeStore } from './storage'

const storage = new ExtensionStorage()
export const EDITOR_HOSTS = ['editor.wix.com', 'create.editorx.com', 'blocks.wix.com']
export const isEditorUrl = (url: URL) => EDITOR_HOSTS.includes(url.host)
function isWixViewer() {
  return !!Array.from(document.getElementsByTagName('meta')).find((e) => e.httpEquiv.indexOf('X-Wix') !== -1)
}
export const isViewer = async (tab?: chrome.tabs.Tab): Promise<boolean> => {
  tab = tab || (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
  const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: isWixViewer })
  return result.result
}

export const isWix = async (tab: chrome.tabs.Tab): Promise<boolean> =>
  isEditorUrl(new URL(tab.url)) || (await isViewer(tab))

const EDITOR_PERSISTENT_PARAMS = ['metaSiteId', 'templateId', 'editorSessionId', 'http_referer']

const createSetParam =
  ({ searchParams }: URL) =>
  (condition, key, value: string) => {
    if (condition) {
      searchParams.set(key, value)
    }
  }

export const createSetPetriOvr = (url: URL) => (condition, spec: string, disable?: boolean) => {
  const setParam = createSetParam(url)
  const petriOvr = new Set(url.searchParams.get('petri_ovr')?.split(';'))
  if (condition) {
    petriOvr.add(`${spec}:true`)
  } else if (disable) {
    petriOvr.add(`${spec}:false`)
  } else {
    petriOvr.delete(`${spec}:true`)
  }
  setParam(petriOvr.size > 0, 'petri_ovr', [...petriOvr].join(';'))
}

const updateFleet = (url: URL, fleet: Fleet, version: string) => {
  const setParam = createSetParam(url)
  const isEditor = isEditorUrl(url)

  if (fleet === 'Local') {
    setParam(isEditor, 'viewerSource', 'https://localhost:5200/')
    setParam(!isEditor, 'ssrDebug', 'true')
  } else if (fleet === 'Custom') {
    setParam(isEditor, 'viewerSource', version)
    setParam(!isEditor, 'thunderboltTag', version)
  }
}

export const updateUrl = async (serializedStore?: SerializeStore) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab || !(isEditorUrl(new URL(tab.url)) || (await isViewer(tab)))) {
    return
  }
  const url = new URL(tab.url)
  const isEditor = isEditorUrl(url)
  if (!isEditor) {
    url.search = ''
  } else {
    const search = EDITOR_PERSISTENT_PARAMS.filter((key) => url.searchParams.has(key))
      .map((key) => `${key}=${url.searchParams.get(key)}`)
      .join('&')

    url.search = `?${search}`
  }

  const setParam = createSetParam(url)
  const setPetriOvr = createSetPetriOvr(url)
  serializedStore = serializedStore || (await storage.serialize())

  const storageKeyResolver: {
    [key in Exclude<keyof SerializeStore, 'shouldOverrideEditorElements' | 'version'>]: () => void
  } = {
    debug: () => setParam(serializedStore.debug, isEditor ? 'debugViewer' : 'debug', 'true'),
    disableHtmlEmbeds: () => setParam(serializedStore.disableHtmlEmbeds, 'disableHtmlEmbeds', 'true'),
    suppressBI: () => setParam(serializedStore.suppressBI, 'suppressbi', 'true'),
    disablePlatform: () => setParam(serializedStore.disablePlatform, 'disablePlatform', 'true'),
    editorElementsOverride: () =>
      setParam(
        serializedStore.shouldOverrideEditorElements && serializedStore.editorElementsOverride,
        'editor-elements-override',
        serializedStore.editorElementsOverride
      ),
    experiments: () =>
      setParam(serializedStore.experiments.length > 0, 'experiments', serializedStore.experiments.join(',')),
    isqa: () => setParam(serializedStore.isqa, 'isqa', 'true'),
    ssrOnly: () => setParam(serializedStore.ssrOnly, 'ssrOnly', 'true'),
    fleet: () => updateFleet(url, serializedStore.fleet, serializedStore.version),
    clientOnly: () => setPetriOvr(serializedStore.clientOnly, 'specs.ExcludeSiteFromSsr'),
    forceCache: () => setPetriOvr(serializedStore.forceCache, 'specs.EnableSsrCacheOnSite'),
    queryParams: () => {
      serializedStore.queryParams.forEach((param) => {
        const [key, value = 'true'] = param.split('=')
        url.searchParams.set(key, value)
      })
    },
  }

  // Update the URL with all the values from the serialized store
  Object.values(storageKeyResolver).forEach((resolver) => resolver())

  // Change the protocol to http if we use local public flow
  if (url.searchParams.has('ssrDebug')) {
    url.protocol = 'http'
  }
  chrome.tabs.update(tab.id, { url: url.href })
}

export const updateStoreFromUrl = async (href: string) => {
  const url = new URL(href)
  const { searchParams } = url

  if (typeof localStorage === 'undefined') {
    globalThis.localStorage = null
  }

  // Store all the query params that has a special storage key
  const restOfQueryParams = new Set(searchParams.keys())
  const isEditor = isEditorUrl(url)
  if (isEditor) {
    EDITOR_PERSISTENT_PARAMS.forEach((key) => restOfQueryParams.delete(key))
  }
  const readParam = (key: string) => {
    const value = searchParams.get(key)
    restOfQueryParams.delete(key)
    return value
  }
  const petriOvr = new Set((readParam('petri_ovr') || '').split(';'))

  const storageKeyResolver: { [key in Exclude<keyof SerializeStore, 'queryParams'>]: () => SerializeStore[key] } = {
    debug: () => readParam('debug') === 'true' || readParam('debugViewer') === 'true',
    disableHtmlEmbeds: () => readParam('disableHtmlEmbeds') === 'true',
    suppressBI: () => readParam('suppressbi') === 'true',
    disablePlatform: () => readParam('disablePlatform') === 'true',
    editorElementsOverride: () => readParam('editor-elements-override'),
    shouldOverrideEditorElements: () => searchParams.has('editor-elements-override'),
    experiments: () => readParam('experiments')?.split(',') ?? [],
    isqa: () => readParam('isqa') === 'true',
    ssrOnly: () => readParam('ssrOnly') === 'true',
    fleet: () => {
      if (readParam('ssrDebug')) {
        return 'Local'
      }
      const viewerSource = readParam('viewerSource')
      if (viewerSource) {
        return viewerSource === 'https://localhost:5200/' ? 'Local' : 'Custom'
      }
      return 'None'
    },
    version: () => {
      if (isEditor) {
        const viewerSource = readParam('viewerSource') || ''
        return viewerSource === 'https://localhost:5200' ? '' : viewerSource
      }
      return readParam('thunderboltTag') || ''
    },
    clientOnly: () => petriOvr.has('specs.ExcludeSiteFromSsr:true'),
    forceCache: () => petriOvr.has('specs.EnableSsrCacheOnSite:true'),
  }

  await Promise.all(
    Object.entries(storageKeyResolver).map(([key, resolver]) => storage.set(key as keyof SerializeStore, resolver()))
  )

  const queryParams = Array.from(restOfQueryParams.values()).map(
    (key) => (searchParams.get(key) ? `${key}=${searchParams.get(key)}` : key),
    [] as Array<string>
  )
  await storage.set('queryParams', queryParams)
}
