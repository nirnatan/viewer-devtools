import { BoxWithLabel, StoreSwitch } from '~components'

export const Platform = () => {
  return (
    <BoxWithLabel label="Platform">
      <StoreSwitch storeKey="disablePlatform" label="Disable Platform" />
    </BoxWithLabel>
  )
}
