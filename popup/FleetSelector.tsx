import { TextField } from '@mui/material';
import { BoxWithLabel, StyledSwitch } from '~components';
import { useStorage } from '~utils/storage';


export const FleetSelector = () => {
  const [fleet, setFleet] = useStorage('fleet', 'None')
  const [customVersion, setCustomVersion] = useStorage('version', '')

  const customInput = (
    <TextField
      size="small"
      sx={{ flex: 2 }}
      value={customVersion}
      label="Enter Version or hash"
      onBlur={(e) => setCustomVersion(e.target.value)}
      onChange={(e) => setCustomVersion(e.target.value)}
    />
  )

  return (
    <BoxWithLabel label="Version">
      <StyledSwitch
        label="Local"
        checked={fleet === 'Local'}
        onChange={(__, checked) => setFleet(checked ? 'Local' : 'None')}
      />
      <StyledSwitch
        label="Custom"
        checked={fleet === 'Custom'}
        onChange={(__, checked) => setFleet(checked ? 'Custom' : 'None')}
      />
      {fleet === 'Custom' && customInput}
    </BoxWithLabel>
  )
}