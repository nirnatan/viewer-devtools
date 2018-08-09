(function contentScript() {
  const onClick = (project, pullRequestNumber) => () => {
    switch (project) {
      case 'santa':
        window.open(`http://pullrequest-tc.dev.wixpress.com/project.html?projectId=Santa_Santa&branch_Santa_Santa=${pullRequestNumber}/merge`);
        break;
      case 'santa-editor':
        window.open(`http://pullrequest-tc.dev.wixpress.com/viewType.html?buildTypeId=MonoRepoTest_SantaEditor&branch_MonoRepoTest=${pullRequestNumber}&tab=buildTypeStatusDiv`);
        break;
      case 'santa-core':
        window.open(`http://pullrequest-tc.dev.wixpress.com/viewType.html?buildTypeId=MonoRepoTest_SantaCore&branch_MonoRepoTest=${pullRequestNumber}&tab=buildTypeStatusDiv`);
        break;
    }
  };

  const projectRegEx = /https:\/\/github.com\/wix-private\/(.*)\/pull\/(.*)/;
  const [, project, pullRequestNumber] = projectRegEx.exec(location.href);

  const element = document.getElementsByClassName('gh-header-number')[0];

  element.style.cursor = 'pointer';
  element.onclick = onClick(project, pullRequestNumber);
}());
