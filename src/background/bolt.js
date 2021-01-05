export const debugPackage = (project, pkg) => {
    getActiveTab().then(({ id, url }) => {
      const parsedUrl = new URL(url, true);
      delete parsedUrl.search;
      if (!parsedUrl.query.debug) {
        parsedUrl.query.debug = pkg;
        chrome.tabs.update(id, { url: parsedUrl.toString() });
        return;
      }

      const packages = parsedUrl.query.debug.split(',');
      if (parsedUrl.query.debug === 'all' || packages.indexOf(pkg) !== -1) {
        return;
      }

      parsedUrl.query.debug = packages.concat(pkg).join(',');
      chrome.tabs.update(id, { url: parsedUrl.toString() });
    });
  };

  export const debugAll = () => {
    getActiveTab().then(({ id, url }) => {
      const parsedUrl = new URL(url, true);
      delete parsedUrl.search;
      if (parsedUrl.query.debug === 'all') {
        return;
      }

      parsedUrl.query.debug = 'all';
      chrome.tabs.update(id, { url: parsedUrl.toString() });
    });
  };