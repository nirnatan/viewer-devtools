function FindProxyForURL(url, host) {
  if (/frog\.wix\.com/.test(host)) {
    return 'DIRECT'
  }

  if (/ssrDebug/.test(url)) {
    return 'PROXY localhost:4000'
  }
  return 'DIRECT'
}

export const pacScript = FindProxyForURL.toString()
