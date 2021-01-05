import { startsWith } from 'lodash';
import URL from 'url-parse';
import buildUrl from './urlBuilder';
import { openThunderboltPreview, openEditor } from './editor'
import { debugPackage, debugAll } from './bolt'

const getActiveTab = async () => {
  const tab = await new Promise(res => {
    chrome.tabs.query({ active: true, currentWindow: true }, t => res(t[0]));
  });

  if (tab) {
    return tab;
  }

  await new Promise(res => setTimeout(res, 100))
  return getActiveTab()
};

chrome.webRequest.onBeforeRequest.addListener(({ url }) => {
  if (url.includes('ssrDebug') && url.startsWith('https://')) {
    return { redirectUrl: url.replace('https://', 'http://') };
  }

  return {};
}, { urls: ['<all_urls>'] }, ['blocking']);


const executeScript = async script => {
  const { id, url } = await getActiveTab();
  if (startsWith(url, 'chrome')) {
    return Promise.resolve();
  }

  const results = await new Promise(res => chrome.tabs.executeScript(id, {
    code: script,
  }, res))

  return results && results[0]
};

const isViewer = () => executeScript("!!Array.from(document.getElementsByTagName('meta')).find(e => e.httpEquiv.indexOf('X-Wix') !== -1)");

const isEditor = () => getActiveTab().then(tab => tab.url.indexOf('editor.wix.com') !== -1);

const updateBrowserActionIcon = () => {
  Promise.all([isEditor(), isViewer()]).then(([editor, viewer]) => {
    const iconSufix = (editor || viewer) ? '' : '-disabled';
    chrome.browserAction.setIcon({
      path: {
        19: `assets/images/icon-19${iconSufix}.png`,
        38: `assets/images/icon-38${iconSufix}.png`,
      },
    });
  });
};

const sendToContentPage = async request => {
  const { id } = await getActiveTab();
  return new Promise((res => {
    chrome.tabs.sendMessage(id, request, res);
  }));
};

const getCurrentUsername = () => {
  return sendToContentPage({ type: 'getCurrentUsername' });
};

const getCurrentVersions = () => {
  return sendToContentPage({ type: 'getCurrentVersions' });
};

chrome.tabs.onActiveChanged.addListener(() => {
  updateBrowserActionIcon();
  getCurrentVersions().then(ver => {
    window.ver = ver;
  });
});
chrome.tabs.onUpdated.addListener(() => updateBrowserActionIcon());

const applySettings = (option = 'All') => {
  getActiveTab().then(({ url, id }) => {
    buildUrl(url, option).then(newUrl => {
      chrome.tabs.update(id, { url: newUrl });
    });
  });
};

const logBackIn = () => {
  chrome.tabs.create({ url: 'https://users.wix.com/wix-users/login/form' });
};

const addExperiment = experiment => {
  getActiveTab().then(({ url, id }) => {
    const parsedUrl = new URL(url, true);
    delete parsedUrl.search;
    parsedUrl.query.experiments = parsedUrl.query.experiments ? `${parsedUrl.query.experiments},${experiment}` : experiment;

    chrome.tabs.update(id, { url: parsedUrl.toString() });
  });
};

const openOptionsPage = () => {
  const url = chrome.extension.getURL('options.html');
  chrome.tabs.query({ url, currentWindow: true }, tabs => {
    if (!tabs || tabs.length === 0) {
      window.open(url);
    } else {
      chrome.tabs.update(tabs[0].id, { selected: true });
    }
  });
};

const isMobileView = async () => {
  const { url } = await getActiveTab();
  const parsedUrl = new URL(url, true);
  return parsedUrl.query.showMobileView === 'true';
};

const setMobileView = isMobile => {
  getActiveTab().then(({ url, id }) => {
    const parsedUrl = new URL(url, true);
    delete parsedUrl.search;
    parsedUrl.query.showMobileView = isMobile;

    chrome.tabs.update(id, { url: parsedUrl.toString() });
  });
};

const BLANK_TEMPLATE_URL = 'https://editor.wix.com/html/editor/web/renderer/new?siteId=9e02c429-1e9f-4155-b083-05b3988ad94e&metaSiteId=8e64be00-3fd1-491d-800f-9509eadd08bb&editorSessionId=B32BCCDD-9757-4635-B813-450BD81FDDD1';
const commands = {
  'debug-ssr': () => applySettings('Thunderbolt_SSR_Debug'),
  'open-editor': () => openEditor(),
  'open-blank-editor': () => window.open(BLANK_TEMPLATE_URL),
};
chrome.commands.onCommand.addListener(command => {
  commands[command]();
});

/**
 * All the utils that will be available to the popup and options pages.
 */
window.Utils = {
  openPreview: openThunderboltPreview,
  applySettings,
  logBackIn,
  getCurrentUsername,
  isViewer,
  isEditor,
  isMobileView,
  setMobileView,
  addExperiment,
  debugPackage,
  debugAll,
  openOptionsPage,
  openEditor,
  getCurrentVersions,
};
