/* global _ */
(() => {
  function inIframe () {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
  if (inIframe()) {
    const s = document.createElement('script');
    s.src = chrome.extension.getURL('frameDataChecker.js');
    document.body.appendChild(s);
    s.onload = () => {
      s.parentNode.removeChild(s);
    };
  } else {
    window.addEventListener('message', (e) => {
      if (event.data === 'bolt' || event.data === 'santa') {
        const isBolt = event.data === 'bolt';
        const boltItitle = `Click will switch experiment to ${isBolt ? 'Santa' : 'Bolt'}`;
        let boltI = document.querySelector('div.boltIndicator');
        if (boltI) {
          document.body.removeChild(boltI);
        }

        boltI = document.createElement('div');
        boltI.classList.add('boltIndicator');
        boltI.setAttribute('alt', boltItitle);
        boltI.setAttribute('title', boltItitle);
        boltI.textContent = event.data;
        boltI.addEventListener('click', () => {
          let url = location.href;
          if (!url.toLowerCase().includes('petri_ovr')) {
            url = `${url}&petri_ovr=specs.UseBoltInPreview:${isBolt ? 'false' : 'true'}`;
          } else {
            url = url.replace(/(petri_ovr=).*?(&|$)/, `$1specs.UseBoltInPreview:${isBolt ? 'false' : 'true'}$2`);
          }

          location.assign(url);
        });

        document.body.appendChild(boltI);
      }
    });
  }
})();
