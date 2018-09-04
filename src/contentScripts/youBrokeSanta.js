import { some, forEach } from 'lodash';

const run = async () => {
  const main = document.createElement('div');
  main.innerHTML = `<div class="you-broke-santa">
    <style>
        .you-broke-santa {
            width: 100vw;
            background-color: red;
            z-index: 999999999;
            position: fixed;
            top: 0;
        }

        .you-broke-santa-main {
            height: 60px;
            display: flex;
            align-items: center;
        }

        .you-broke-santa-pic {
            width: 60px;
            height: 60px;
            margin-right: 10px;
        }

        .you-broke-santa-title {
            margin-top: 20px;
        }
    </style>
</div>`;

  document.body.appendChild(main.firstChild);
  const addYouBrokeSanta = ({ url, title }) => {
    const innerDiv = document.createElement('div');
    // language=html
    innerDiv.innerHTML = `<div class="you-broke-santa-main">
      <img src="https://lh3.googleusercontent.com/-SpjTBYJ4PPE/W40938g5syI/AAAAAAAAAD8/fI728gJpGgs0u5eyH2b4tdPLVzzRX3V2QCK8BGAs/w1920-h1067/Album%2B-%2BGoogle%252B%2B2018-09-03%2B16-49-43.png" class="you-broke-santa-pic">
      <h1 class="you-broke-santa-title">Heyyyy... You broke <a href="${url}" target="_blank">${title}</a></h1>
    </div>`;

    document.querySelector('.you-broke-santa').appendChild(innerDiv.firstChild);
  };

  const username = new Promise(res => chrome.storage.local.get('teamCityUsername', ({ teamCityUsername }) => res(teamCityUsername)));
  if (!username) {
    return;
  }
  const currentBuilds = await fetch('https://localhost/proxy?src=http://rudolph.wixpress.com/services/getAllCurrentBuildStates').then(res => res.json());
  forEach(currentBuilds, ({ buildData }, artifact) => {
    const { state, status, lastChanges, title, webUrl: url } = buildData;
    if (state === 'finished' && status !== 'SUCCESS' && lastChanges) {
      const youHaveChanges = some(lastChanges.changes, change => change.username === username);
      if (youHaveChanges) {
        fetch(`https://localhost/proxy?src=http://rudolph.wixpress.com/services/getBuildInvestigators?artifact=${artifact}`)
            .then(res => res.json())
            .then(investigators => {
              if (!some(investigators, i => i === username)) {
                addYouBrokeSanta({ url, title });
              }
            });
      }
    }
  });
};

if (window.location.host !== 'tc.dev.wixpress.com' && window.location.host !== 'pullrequest-tc.dev.wixpress.com') {
  run();
}
