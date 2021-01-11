import { getStoreData } from '../store/localStorage';
import buildUrl from './urlBuilder';
import { executeScript } from './utils'

const getSiteIds = async () => {
  const getMetaContent = meta => {
    const script = `(function() {
      const e = Array.from(document.getElementsByTagName('meta')).find(e => e.httpEquiv === '${meta}');
      return e && e.content;
    }());`;

    return executeScript(script);
  };

  const [metaSiteId, siteId] = await Promise.all([
    getMetaContent('X-Wix-Meta-Site-Id'),
    getMetaContent('X-Wix-Application-Instance-Id'),
  ]);

  return {metaSiteId, siteId};
}

export const openEditor = async () => {
  const [metaSiteId, siteId] = await getSiteIds()
  chrome.tabs.getAllInWindow(async (tabs) => {
    let baseUrl = `http://editor.wix.com/html/editor/web/renderer/edit/${siteId}`;
    const editorTab = tabs.find(tab => startsWith(tab.url, baseUrl));
    if (editorTab) {
      chrome.tabs.update(editorTab.id, { selected: true });
      return;
    }
    baseUrl += `?metaSiteId=${metaSiteId}`;
    const url = await buildUrl(baseUrl, 'All');
    chrome.tabs.create({ url });
  });
};

export const openThunderboltPreview = async () => {
    const { settings: { thunderbolt: { fleet } } } = await getStoreData();
    const {metaSiteId, siteId} = await getSiteIds()
    // Remove once we have thunderbolt-ds in CI
    const forceLocal = true

    const searchParams = new URLSearchParams({
      isEdited: 'true',
      dsOrigin: 'Editor1.4',
      lang: 'en',
      metaSiteId,
      disableSave: 'true',
      petri_ovr: 'specs.UseTBAsMainRScript:true',
      ...(forceLocal || fleet === 'ssrDebug' ? {viewerSource: 'https://localhost:4200'} : {})
    })
    const url = `https://editor.wix.com/html/editor/web/renderer/render/document/${siteId}?${searchParams.toString()}`
    chrome.tabs.query({ url, currentWindow: true }, tabs => {
      if (!tabs || tabs.length === 0) {
        chrome.tabs.create({ url })
      } else {
        chrome.tabs.update(tabs[0].id, { selected: true });
      }
    });

  }
