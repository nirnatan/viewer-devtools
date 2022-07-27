import { Box, Tab, Tabs } from '@mui/material'
import { FC, ReactElement, useEffect, useState } from 'react'
import { GoogleAnalytics } from '~components/GoogleAnalytics'
import { ExtensionStorage, useStorage } from '~utils/storage'
import { updateStoreFromUrl } from '~utils/urlManager'
import styles from './popup.module.scss'
import { MainConfig } from './tabs/Main'
import { Presets } from './tabs/Presets'
import { Settings } from './tabs/Settings'

const TabPanel: FC<{ children: ReactElement; value: number; index: number }> = ({ children, value, index }) => {
  if (value !== index) {
    return null
  }
  return children
}

const handleAutoUpdate = async () => {
  const storage = new ExtensionStorage()
  if (await storage.get('autoUpdateFromUrl')) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    updateStoreFromUrl(tab.url)
  }
}

function IndexPopup() {
  const [value, setValue] = useStorage('tabId', 0)

  useEffect(() => {
    handleAutoUpdate()
  }, [])

  return (
    <GoogleAnalytics page="popup">
      <Box className={styles.popup}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 1 }}>
          <Tabs value={value} onChange={(__, value) => setValue(value)}>
            <Tab label="Main" value={0} />
            <Tab label="Presets" value={1} />
            <Tab label="Settings" value={2} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <MainConfig />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Presets />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Settings />
        </TabPanel>
      </Box>
    </GoogleAnalytics>
  )
}

export default IndexPopup
