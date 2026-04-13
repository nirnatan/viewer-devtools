import { Storage } from '@plasmohq/storage'
import { pacScript } from './pac_script.mjs'
import { RULE_ID, ssrDebugRedirectRule } from './debugRedirect'

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
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [ssrDebugRedirectRule],
      removeRuleIds: [RULE_ID],
    })
  } else {
    chrome.proxy.settings.clear({})
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID] })
  }
}

storage.watch({
  proxy: ({ newValue }) => handleProxyChange(newValue),
})

export const initProxy = async () => {
  handleProxyChange(await storage.get('proxy'))
}
