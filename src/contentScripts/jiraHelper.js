(() => {
  const anchors = Array.from(document.getElementsByTagName('a'));
  const login = anchors.find(x => x.innerText.startsWith('Sign in'));
  if (login) {
    login.click();
  }

  anchors
    .filter(a => a.href.indexOf('jira.wixpress.com') === -1)
    .forEach(anchor => {
      anchor.target = '_blank';
    });
})();
