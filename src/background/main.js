import { startsWith } from 'lodash';
import URL from 'url-parse';
import buildUrl from './urlBuilder';

let currentUrl;
let tabId;

chrome.tabs.onActiveChanged.addListener(id => {
  chrome.tabs.get(id, tab => {
    if (tab.url.indexOf('chrome-devtools') !== 0 && tab.url.indexOf('chrome-extension') !== 0) {
      currentUrl = tab.url;
      tabId = id;
    }
  });
});

chrome.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  if (tabId === id) {
    currentUrl = changeInfo.url || tab.url;
  }
});

const applySettings = (option = 'All') => {
  buildUrl(currentUrl, option).then(url => {
    chrome.tabs.update(tabId, { url });
  });
};

const logBackIn = () => {
  chrome.tabs.create({ url: 'https://users.wix.com/wix-users/login/form' });
};

const sendToContentPage = request => (
  new Promise((res => {
    chrome.tabs.sendMessage(tabId, request, res);
  }))
);

const getCurrentUsername = () => {
  return sendToContentPage({ type: 'getCurrentUsername' });
};

const addExperiment = experiment => {
  const parsedUrl = new URL(currentUrl, true);
  delete parsedUrl.search;
  parsedUrl.query.experiments = parsedUrl.query.experiments ? `${parsedUrl.query.experiments},${experiment}` : experiment;

  chrome.tabs.update(tabId, { url: parsedUrl.toString() });
};

const openOptionsPage = () => {
  const optionsURL = chrome.extension.getURL('options.html');
  window.open(optionsURL);
};

const debugPackage = (project, pkg) => {
  const parsedUrl = new URL(currentUrl, true);
  delete parsedUrl.search;
  if (!parsedUrl.query.debug) {
    parsedUrl.query.debug = pkg;
    chrome.tabs.update(tabId, { url: parsedUrl.toString() });
    return;
  }

  const packages = parsedUrl.query.debug.split(',');
  if (parsedUrl.query.debug === 'all' || packages.indexOf(pkg) !== -1) {
    return;
  }


  chrome.tabs.update(tabId, { url: parsedUrl.toString() });
};

const executeScript = script => {
  return new Promise(res => {
    chrome.tabs.executeScript(tabId, {
      code: script,
    }, results => res(results[0]));
  });
};

const isViewer = () => executeScript("!!Array.from(document.getElementsByTagName('meta')).find(e => e.httpEquiv === 'X-Wix-Renderer-Server')");

const isEditor = () => executeScript("!!Array.from(document.getElementsByTagName('meta')).find(e => e.httpEquiv === 'X-Wix-Editor-Server')");

const isMobileView = () => {
  const parsedUrl = new URL(currentUrl, true);
  return parsedUrl.query.showMobileView === 'true';
};

const setMobileView = isMobile => {
  const parsedUrl = new URL(currentUrl, true);
  delete parsedUrl.search;
  parsedUrl.query.showMobileView = isMobile;

  chrome.tabs.update(tabId, { url: parsedUrl.toString() });
};

const openEditor = () => {
  const getMetaContent = meta => {
    const script = `(function() {
      const e = Array.from(document.getElementsByTagName('meta')).find(e => e.httpEquiv === '${meta}');
      return e && e.content;
    }());`;

    return executeScript(script);
  };

  Promise.all([
    getMetaContent('X-Wix-Meta-Site-Id'),
    getMetaContent('X-Wix-Application-Instance-Id'),
  ]).then(([metaSiteId, siteId]) => {
    chrome.tabs.getAllInWindow(tabs => {
      let baseUrl = `http://editor.wix.com/html/editor/web/renderer/edit/${siteId}`;
      const editorTab = tabs.find(tab => startsWith(tab.url, baseUrl));
      if (editorTab) {
        chrome.tabs.update(editorTab.id, { selected: true });
        return;
      }
      baseUrl += `?metaSiteId=${metaSiteId}`;
      buildUrl(baseUrl, 'All').then(url => {
        chrome.tabs.create({ url });
      });
    });
  });
};

/**
 * All the utils that will be available to the popup and options pages.
 */
window.Utils = {
  applySettings,
  logBackIn,
  getCurrentUsername,
  isViewer,
  isEditor,
  isMobileView,
  setMobileView,
  addExperiment,
  debugPackage,
  openOptionsPage,
  openEditor,
};
