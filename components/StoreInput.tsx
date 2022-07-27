import { FormControl, InputLabel, TextField, TextFieldProps } from '@mui/material'
import type { FC } from 'react'
import { StorageKeys, useStorage } from '~utils/storage'

export const StoreInput: FC<TextFieldProps & { storeKey: StorageKeys }> = ({ storeKey, label, disabled, ...props }) => {
  const [value, setValue] = useStorage(storeKey, '')
  return (
    <TextField
      label={label}
      fullWidth
      disabled={disabled}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      {...props}
    />
  )
}
