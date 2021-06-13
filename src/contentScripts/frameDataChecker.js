/* global _ */
(() => {
  const createIndicator = async event => {
    if (['bolt', 'thunderbolt'].includes(event.data)) {
      const isThunderbolt = event.data === "thunderbolt";
      const viewerItitle = `Click will switch editor to ${
        isThunderbolt ? "bolt" : "thunderbolt"
      }`;
      let viewerI = document.querySelector("div.boltIndicator");
      if (viewerI) {
        document.body.removeChild(viewerI);
      }

      viewerI = document.createElement("div");
      viewerI.classList.add("boltIndicator");
      viewerI.setAttribute("alt", viewerItitle);
      viewerI.setAttribute("title", viewerItitle);
      const viewerSource = new URL(window.location.href).searchParams.get('viewerSource')
      const version = viewerSource && viewerSource.includes('localhost') ? 'local' : viewerSource
      viewerI.textContent = version && isThunderbolt ? `${event.data} (${version})` : event.data;
      viewerI.addEventListener("click", () => {
        let url = location.href;
        const petriOverrides = isThunderbolt ?
          'specs.UseTbInPreview:false' : // Force bolt
          'specs.UseTBAsMainRScript:true'; // Force thunderbolt
        if (!url.toLowerCase().includes("petri_ovr")) {
          url = `${url}&petri_ovr=${petriOverrides}`;
        } else {
          url = url.replace(/(petri_ovr=).*?(&|$)/, `$1${petriOverrides}$2`);
        }

        location.assign(url);
      });

      document.body.appendChild(viewerI);
      window.removeEventListener("message", createIndicator);
    }
  };

  function inIframe() {
    try {
      return window !== window.top;
    } catch (e) {
      return true;
    }
  }

  function getViewerName() {
    const thunderboltScript = document.querySelector(
      'script[src*="tb-main/dist/tb-main.js"]'
    );

    return thunderboltScript ? 'thunderbolt' : 'bolt'
  }

  if (inIframe()) {
    window.parent.postMessage(getViewerName(), "*");
  } else {
    window.addEventListener("message", createIndicator);
  }
})();
