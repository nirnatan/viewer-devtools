import { Storage } from '@plasmohq/storage'
import { pacScript } from './pac_script.mjs'
import { useHttpForSsrDebug } from './debugRedirect'

const storage = new Storage()

const handleProxyChange = async (proxy: boolean) => {
  if (proxy) {
    chrome.proxy.settings.set({
      value: {
        mode: 'pac_script',
        pacScript: {
          data: pacScript,
        },
      },
      scope: 'regular',
    })
    await useHttpForSsrDebug()
  } else {
    chrome.proxy.settings.clear({})
  }
}

storage.watch({
  proxy: ({ newValue }) => handleProxyChange(newValue),
})

export const initProxy = async () => {
  handleProxyChange(await storage.get('proxy'))
}
