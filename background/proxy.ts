import { Storage } from '@plasmohq/storage'
import { pacScript } from './pac_script.mjs'

const storage = new Storage()

const handleProxyChange = (proxy) => {
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
