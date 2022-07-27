import { BoxWithLabel } from '~components/BoxWithLabel'
import { StoreSwitch } from '~components/StoreSwitch'

export const Flags = () => {
  return (
    <BoxWithLabel sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }} label="Flags">
      <StoreSwitch storeKey="debug" label="Debug" />
      <StoreSwitch storeKey="isqa" label="QA Mode" />
      <StoreSwitch storeKey="disableHtmlEmbeds" label="Disable HTML Embeds" />
      <StoreSwitch storeKey="ssrOnly" label="SSR Only" />
      <StoreSwitch storeKey="clientOnly" label="Client Only" />
      <StoreSwitch storeKey="forceCache" label="Force SSR Cache" />
    </BoxWithLabel>
  )
}
