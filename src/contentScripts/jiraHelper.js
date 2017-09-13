(() => {
  Array.from(document.querySelectorAll('a'))
    .filter(a => a.href.indexOf('jira.wixpress.com') === -1)
    .forEach(anchor => {
      anchor.target = '_blank';
    });
})();
