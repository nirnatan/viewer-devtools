import { isWix } from '~utils/urlManager'
import { useHttpForSsrDebug } from './debugRedirect'
import { initProxy } from './proxy'

// Update the badge of the extension according to whether the current tab is a Wix URL
chrome.action.setBadgeBackgroundColor({ color: '#0000' })
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId)
  if (await isWix(tab)) {
    chrome.action.setBadgeText({ text: 'ON' })
  } else {
    chrome.action.setBadgeText({ text: '' })
  }
})

initProxy()
useHttpForSsrDebug()

export {}
