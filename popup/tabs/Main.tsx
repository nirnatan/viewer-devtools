import { Box, Button, InputAdornment, TextField } from '@mui/material'
import { useState } from 'react'
import { useStorage } from '@plasmohq/storage'
import { ExtensionStorage } from '~utils/storage'
import { updateStoreFromUrl, updateUrl } from '~utils/urlManager'
import { EditorElements } from '../EditorElements'
import { Experiments } from '../Experiments'
import { Flags } from '../Flags'
import { FleetSelector } from '../FleetSelector'
import { Platform } from '../Platform'
import { QueryParams } from '../QueryParams'

const navigate = () => {
  updateUrl()
}

const syncFromUrl = async (tab?: chrome.tabs.Tab) => {
  if (!tab) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    tab = tabs[0]
  }

  updateStoreFromUrl(tab.url)
}

const SavePreset = () => {
  const [selectedPreset, setSelectedPreset] = useStorage('selectedPreset', '')
  const [showInput, setShowInput] = useState<boolean>(false)
  const storage = new ExtensionStorage()

  const handleKeyUp = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.key === 'Enter') {
      setSelectedPreset('')
      storage.addPreset((e.target as HTMLInputElement).value)
      setShowInput(false)
    } else if (e.key === 'Escape') {
      setSelectedPreset('')
      setShowInput(false)
    }
  }

  const handleBlur = () => {
    setSelectedPreset('')
    setShowInput(false)
  }

  return showInput || selectedPreset ? (
    <TextField
      onKeyUp={handleKeyUp}
      onBlur={handleBlur}
      onChange={(e) => {
        setSelectedPreset(e.target.value)
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment sx={{ cursor: 'pointer' }} onClick={() => handleBlur()} position="start">
            x
          </InputAdornment>
        ),
      }}
      defaultValue={selectedPreset}
      label="Preset Name"
      fullWidth
    />
  ) : (
    <Button color="primary" fullWidth sx={{ height: '55px' }} onClick={() => setShowInput(true)}>
      Save Preset
    </Button>
  )
}

export const MainConfig = () => {
  const [autoUpdateFromUrl] = useStorage('autoUpdateFromUrl', false)

  return (
    <>
      <FleetSelector />
      <Flags />
      <Experiments />
      <Platform />
      <EditorElements />
      <QueryParams />
      <Box sx={{ flexDirection: 'row', display: 'flex' }}>
        <Button color="primary" fullWidth sx={{ height: '55px' }} onClick={navigate}>
          Apply
        </Button>
        {!autoUpdateFromUrl && (
          <Button color="info" fullWidth sx={{ height: '55px' }} onClick={() => syncFromUrl()}>
            Sync From URL
          </Button>
        )}
        <SavePreset />
      </Box>
    </>
  )
}
