export const RULE_ID = 4987235

export const ssrDebugRedirectRule: chrome.declarativeNetRequest.Rule = {
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
}
