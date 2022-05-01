/* global _ */
(() => {
  const getIndicatorStyle = () => {
    const style = document.createElement("style")
    style.innerHTML = `
  .boltIndicator {
    color: red;
    position: absolute;
    bottom: 0px;
    left: 0px;
    padding: 5px;
    background: #eee;
    border: 1px solid #aaa;
    cursor: pointer;
    z-index: 9999;
  }
  `
    return style
  }

  const getIndicator = (viewerName) => {
    const isThunderbolt = viewerName === 'thunderbolt'
    const viewerI = document.createElement("div")
    viewerI.classList.add("boltIndicator")

    const viewerItitle = `Click will switch editor to ${ isThunderbolt ? "bolt" : "thunderbolt" }`
    viewerI.setAttribute("alt", viewerItitle)
    viewerI.setAttribute("title", viewerItitle)
    const viewerSource = new URL(window.location.href).searchParams.get('viewerSource')
    const version = viewerSource && viewerSource.includes('localhost') ? 'local' : viewerSource
    viewerI.textContent = version && isThunderbolt ? `${event.data} (${version})` : event.data
    document.body.appendChild(viewerI)

    return viewerI
  }

  const bc = new BroadcastChannel('indicator')

  const petri_ovrs = {
    'editor.wix.com': 'specs.UseTbInPreview',
    'create.editorx.com': 'specs.UseTbInPreviewForResponsive',
    'blocks.wix.com': 'specs.UseTbInPreviewForBlocks',
  }

  const experiment = petri_ovrs[window.location.host]
  /**
   *
   * @param {MessageEvent<string>} event
   */
  const createIndicator = async event => {
    const style = getIndicatorStyle()
    const indicator = getIndicator(event.data)
    indicator.addEventListener("click", () => {
      let url = location.href
      const petriOverrides = event.data === 'thunderbolt' ?
        `${experiment}:false` : // Use Bolt
        `${experiment}:true`; // Force thunderbolt
      if (!url.toLowerCase().includes("petri_ovr")) {
        url = `${url}&petri_ovr=${petriOverrides}`
      } else {
        url = url.replace(/(petri_ovr=).*?(&|$)/, `$1${petriOverrides}$2`)
      }

      location.assign(url)
    })

    document.head.appendChild(style)
    document.body.appendChild(indicator)
    bc.close()
  }

  const inIframe = () => {
    try {
      return window !== window.top
    } catch (e) {
      return true
    }
  }

  if (inIframe()) {
    console.log(`iframe detected - ${window.location.href}`)
    const thunderboltScript = document.querySelector(
      'script[src*="tb-main/dist/tb-main.js"]'
    )

    const viewerName = thunderboltScript ? 'thunderbolt' : 'bolt'

    bc.postMessage(viewerName)
    bc.close()
  } else {
    console.log(`main window - ${window.location.href}`)
    bc.addEventListener("message", createIndicator)
  }
})()
