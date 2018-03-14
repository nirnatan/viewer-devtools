import { map, findIndex } from 'lodash';
import { ajax } from 'jquery';

export const requestVersions = () => {
  const requests = {
    editor: 'http://rudolph.wixpress.com/services/availableRcs?project=santa-editor',
    viewer: 'http://rudolph.wixpress.com/services/availableRcs?project=santa-viewer',
  };

  const result = { editor: [], viewer: [] };
  return Promise.all(map(requests, (url, key) => {
    return fetch(url)
      .then(res => res.json())
      .then(res => {
        result[key] = res.result;
      })
      .catch(() => {});
  })).then(() => result);
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
