import { startsWith } from 'lodash';

export const getActiveTab = async () => {
    const tab = await new Promise(res => {
      chrome.tabs.query({ active: true, currentWindow: true }, t => res(t[0]));
    });

    if (tab) {
      return tab;
    }

    await new Promise(res => setTimeout(res, 100))
    return getActiveTab()
  };

export const executeScript = async script => {
    const { id, url } = await getActiveTab();
    if (startsWith(url, 'chrome')) {
      return Promise.resolve();
    }

    const results = await new Promise(res => chrome.tabs.executeScript(id, {
      code: script,
    }, res))

    return results && results[0]
  };
