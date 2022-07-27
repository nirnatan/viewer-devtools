import { FormControlLabel, Switch, SwitchProps } from '@mui/material'
import type { FC } from 'react'
import { StorageKeys, useStorage } from '~utils/storage'

export const StoreSwitch: FC<SwitchProps & { storeKey: StorageKeys; label: string }> = ({
  storeKey,
  label,
  ...props
}) => {
  const [checked, setChecked] = useStorage(storeKey, false)
  return <StyledSwitch {...props} checked={checked} onChange={(e) => setChecked(e.target.checked)} label={label} />
}

export const StyledSwitch: FC<SwitchProps & { label: string }> = ({ label, ...props }) => (
  <FormControlLabel
    componentsProps={{
      typography: {
        sx: { fontSize: '12px' },
      },
    }}
    sx={{ minWidth: 'fit-content' }}
    control={<Switch {...props} />}
    labelPlacement="end"
    label={label}
  />
)
