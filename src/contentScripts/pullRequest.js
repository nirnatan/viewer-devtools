(function contentScript() {
  const buildTypesByProject = {
    'santa': 'Santa_Santa',
    'santa-editor': 'Santa_SantaEditor',
  };

  const projectRegEx = /https:\/\/github.com\/wix-private\/(.*)\/pull\/(.*)/;
  const [, project, pullRequestNumber] = projectRegEx.exec(location.href);

  const element = document.getElementsByClassName('gh-header-number')[0];

  element.style.cursor = 'pointer';
  element.onclick = () => window.open(`http://pullrequest-tc.dev.wixpress.com/viewType.html?buildTypeId=${buildTypesByProject[project]}&branch_Santa=${pullRequestNumber}%2Fmerge`);
}());
