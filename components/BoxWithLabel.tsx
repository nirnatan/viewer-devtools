import { Box, BoxProps, InputLabel } from '@mui/material'
import type { FC } from 'react'

const labelSx = {
  position: 'absolute',
  top: '-8px',
  left: '15px',
  fontSize: '0.7rem',
  background: 'white',
  padding: '0 4px',
}

const defaultFlexStyles = { display: 'flex', flexDirection: 'row', columnGap: 1, height: '55px', alignItems: 'center' }
export const BoxWithLabel: FC<BoxProps & { label: string }> = ({ children, sx, label, ...rest }) => (
  <Box
    {...rest}
    paddingLeft="20px"
    position="relative"
    border="1px solid"
    borderRadius="4px"
    borderColor="rgba(0,0,0,0.2)"
    sx={{
      ...(sx ? sx : defaultFlexStyles),
    }}>
    <InputLabel sx={labelSx}>{label}</InputLabel>

    {children}
  </Box>
)
