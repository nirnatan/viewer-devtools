const RULE_ID = 4987235

export const useHttpForSsrDebug = async () => {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
  })
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: RULE_ID,
        condition: {
          urlFilter: 'https://*ssrDebug*',
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            transform: {
              scheme: 'http',
            },
          },
        },
      },
    ],
    removeRuleIds: [RULE_ID],
  })
}
