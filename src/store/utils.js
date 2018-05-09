import { map, findIndex } from 'lodash';
import { ajax } from 'jquery';

const semVer = /\d\.(\d+)\.(\d+)/;
const sortSemVer = (first, second) => {
  const [, minorA, patchA] = semVer.exec(first);
  const [, minorB, patchB] = semVer.exec(second);
  return parseInt(minorB, 10) - parseInt(minorA, 10) || parseInt(patchB, 10) - parseInt(patchA, 10);
};

const getVersionsForProject = (project) => {
  const request = fetch(`https://repo.dev.wixpress.com/artifactory/libs-releases-local/com/wixpress/html-client/${project}`);

  return request
    .then((res) => res.text())
    .then(text => {
      const div = window.document.createElement('div');
      div.innerHTML = text;
      return Array.from(div.querySelectorAll('a'))
      .map(anchorElement => anchorElement.innerText.replace('/', ''))
      .filter(v => semVer.test(v))
      .sort(sortSemVer)
      .slice(0, 1000);
    });
};

export const requestVersions = () => {
  return Promise.all([getVersionsForProject('santa'), getVersionsForProject('santa-editor')])
    .then(([viewer, editor]) => ({ editor, viewer }));
};

export const SPREADSHEETS_IDS = {
  FEATURES: '1Z-QLMn-xyesvLIuU_suoJXVnTizCTx7dkbY2hGFdSLk',
  NAMED_VERSIONS: '1ncHxk6CSE7BZOZVtRhUNb7bp-dL9gJeJUWOUmw3AjC0',
};

export const getSpreadsheetURL = id => `https://docs.google.com/spreadsheets/d/${id}/edit#gid=0`;

export const readSpreadsheet = id => {
  return new Promise((res, rej) => {
    ajax({
      url: `https://spreadsheets.google.com/feeds/cells/${id}/od6/public/basic?alt=json`,
      dataType: "json",
      success: ({ feed: { entry } }) => {
        const numOfColumns = findIndex(entry, e => /R(\d)C\d/.exec(e.id.$t)[1] === '2');
        const content = map(entry, 'content.$t');

        const data = {};
        let index = numOfColumns;
        while (index < content.length) {
          const row = {};
          for (let i = 0; i < numOfColumns; i++, index++) {
            const key = content[i];
            row[key] = content[index];
          }
          data[row[content[0]]] = row;
        }

        res(data);
      },
      error: rej,
    });
  });
};
