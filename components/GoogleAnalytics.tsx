import 'https://www.googletagmanager.com/gtag/js?id=UA-74190138-1'
import { FC, ReactElement, useEffect } from 'react'

function gtag() {
  // @ts-ignore
  window.dataLayer.push(arguments)
}

export const GoogleAnalytics: FC<{ children: ReactElement; page: string }> = ({ children, page }) => {
  useEffect(() => {
    // @ts-ignore
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || gtag

    window.gtag('js', new Date())
    window.gtag('config', 'UA-74190138-1', {
      page_path: `/${page}`,
      debug_mode: true,
    })
  }, [])

  return children
}
