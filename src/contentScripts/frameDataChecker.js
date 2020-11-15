/* global _ */
(() => {
  const createIndicator = event => {
    if (["bolt", "santa", "thunderbolt"].includes(event.data)) {
      const isBolt = event.data === "bolt";
      const viewerItitle = `Click will switch experiment to ${
        isBolt ? "viewer by default" : "Bolt"
      }`;
      let viewerI = document.querySelector("div.boltIndicator");
      if (viewerI) {
        document.body.removeChild(viewerI);
      }

      viewerI = document.createElement("div");
      viewerI.classList.add("boltIndicator");
      viewerI.setAttribute("alt", viewerItitle);
      viewerI.setAttribute("title", viewerItitle);
      viewerI.textContent = event.data;
      viewerI.addEventListener("click", () => {
        let url = location.href;
        const isBoltString = isBolt ? "false" : "true";
        const petriOverrides = `specs.UseBoltInPreview:${isBoltString};specs.useBoltInAppBuilderPreview:${isBoltString}`;
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
    const boltScript = document.querySelector(
      'script[src*="bolt-main/app/main-r.min.js"]'
    );

    if (boltScript) {
      return "bolt";
    }

    const thunderboltScript = document.querySelector(
      'script[src*="tb-main/dist/tb-main.js"]'
    );

    if (thunderboltScript) {
      return "thunderbolt";
    }

    return "santa"
  }

  if (inIframe()) {
    window.parent.postMessage(getViewerName(), "*");
  } else {
    createIndicator({ data: getViewerName() });
    window.addEventListener("message", createIndicator);
  }
})();
