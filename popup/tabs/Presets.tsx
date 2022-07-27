import { Box, Menu, MenuItem, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { FC, MouseEvent, useState } from 'react'
import { ExtensionStorage, SerializeStore, useStorage } from '~utils/storage'
import { updateUrl } from '~utils/urlManager'

const Preset: FC<{ preset: string; value: SerializeStore }> = ({ preset, value }) => {
  const storage = new ExtensionStorage()
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
  } | null>(null)

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    )
  }

  const editPreset = () => {
    setContextMenu(null)
    storage.set('selectedPreset', preset)
    storage.deserialize(value)

    // Move to the main tab
    storage.set('tabId', 0)
  }

  const deletePreset = () => {
    setContextMenu(null)
    storage.removePreset(preset)
  }

  return (
    <Box key={preset}>
      <ToggleButton
        value={preset}
        onContextMenu={onContextMenu}
        onClick={() => updateUrl(value)}
        sx={{ minWidth: '100px', textTransform: 'capitalize' }}>
        <Typography variant="caption">{preset}</Typography>
      </ToggleButton>
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}>
        <MenuItem onClick={editPreset}>Edit</MenuItem>
        <MenuItem onClick={deletePreset}>Delete</MenuItem>
      </Menu>
    </Box>
  )
}

export const Presets: FC = () => {
  const [presets] = useStorage('presets', {} as Record<string, SerializeStore>)

  const presetsEntries = Object.entries(presets)
  if (presetsEntries.length === 0) {
    return <Box>No presets</Box>
  }

  const presetsToggles = presetsEntries.map(([preset, serializedStore]) => (
    <Preset key={preset} preset={preset} value={serializedStore} />
  ))

  return (
    <Box>
      <ToggleButtonGroup>
        <Box display="flex" flexDirection="row" columnGap={1}>
          {presetsToggles}
        </Box>
      </ToggleButtonGroup>
    </Box>
  )
}
