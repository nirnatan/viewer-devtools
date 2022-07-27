import { Box } from '@mui/material'
import cssText from 'data-text:~/contents/indicator.css'
import type { PlasmoContentScript } from 'plasmo'
import { Storage, useStorage } from '@plasmohq/storage'
import { createSetPetriOvr } from '~utils/urlManager'

export const config: PlasmoContentScript = {
  matches: ['https://editor.wix.com/*', 'https://create.editorx.com/*', 'https://blocks.wix.com/*'],
  all_frames: true,
  run_at: 'document_end',
}

const createElement = (type: string, props: Record<string, any>) => {
  const element = document.createElement(type)
  Object.entries(props).forEach(([key, value]) => {
    element[key] = value
  })
  return element
}

if (window.top !== window) {
  // Update the storage with the current viewer name
  const thunderboltScript = document.querySelector('script[src*="tb-main/dist/tb-main.js"]')
  new Storage().set('editor-indicator', thunderboltScript ? 'Thunderbolt' : 'Bolt')
} else {
  // Add css for the indicator
  const style = createElement('style', { id: 'viewer-extension-style', textContext: cssText })
  window.document.head.appendChild(style)

  // Add indicator element and the css of it to the document
  const rootElement = createElement('div', { id: 'viewer-extension-root' })
  window.document.body.appendChild(rootElement)
}

export const getRootContainer = async () => {
  return document.querySelector('#viewer-extension-root')
}

const onClick = (viewerName: string) => {
  const tbExperiments = {
    'editor.wix.com': 'specs.UseTbInPreview',
    'create.editorx.com': 'specs.UseTbInPreviewForResponsive',
    'blocks.wix.com': 'specs.UseTbInPreviewForBlocks',
  }

  const experiment = tbExperiments[window.location.host]
  const url = new URL(window.location.href)
  const setPetriOvr = createSetPetriOvr(url)

  setPetriOvr(viewerName !== 'Thunderbolt', experiment, true)
  window.location.href = url.href
}

const Indicator = () => {
  const [viewerName] = useStorage('editor-indicator')
  return (
    <Box onClick={() => onClick(viewerName)} className="indicator">
      {viewerName}
    </Box>
  )
}

export default () => (window.top === window ? <Indicator /> : <div />)
