import { Box } from '@mui/material'
import { useStorage } from '@plasmohq/storage'
import { StoreInput, StoreSwitch } from '~components'

const HowToCreateToken = () => (
  <p style={{ fontSize: '0.8rem', paddingLeft: '5px', margin: 0 }}>
    Create a personal access token at{' '}
    <a rel="noopener" href="https://github.com/settings/tokens/new?scopes=repo" target="_blank">
      https://github.com/settings/tokens/new?scopes=repo
    </a>
  </p>
)

export const Settings = () => {
  const [githubPrivateToken] = useStorage('githubPrivateToken')
  return (
    <Box display="flex" flexDirection="column" paddingLeft="20px">
      <StoreSwitch storeKey="proxy" label="Enable Proxy" />
      <StoreSwitch storeKey="autoUpdateFromUrl" label="Auto Update From URL" />
      <Box sx={{ marginTop: 2 }}>
        {!githubPrivateToken && <HowToCreateToken />}
        <StoreInput storeKey="githubPrivateToken" label="Github Private Token" />
      </Box>
    </Box>
  )
}
