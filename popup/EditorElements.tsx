import { StoreInput, StoreSwitch } from '~components'
import { BoxWithLabel } from '~components/BoxWithLabel'
import { useStorage } from '~utils/storage'

export const EditorElements = () => {
  const [shouldOverride] = useStorage('shouldOverrideEditorElements', false)
  return (
    <BoxWithLabel label="editor-elements">
      <StoreSwitch storeKey="shouldOverrideEditorElements" label="Override Editor Elements" />
      {shouldOverride && <StoreInput size="small" storeKey="editorElementsOverride" label="Enter Version or hash" />}
    </BoxWithLabel>
  )
}
