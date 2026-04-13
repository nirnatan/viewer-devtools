export const RULE_ID = 4987235

export const cleanupSsrDebugRedirectRule = async () => {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
  })
}
