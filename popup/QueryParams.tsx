import { Autocomplete, FormControl, TextField } from '@mui/material'
import { useStorage } from '@plasmohq/storage'

const IGNORED_PARAMS = ['metaSiteId', 'templateId', 'http_referrer']
export const QueryParams = () => {
  const [queryParams, setQueryParams] = useStorage<string[]>('queryParams', (v) => v ?? [])
  return (
    <Autocomplete
      multiple
      limitTags={2}
      freeSolo
      options={queryParams}
      value={queryParams}
      onChange={(__, value) => setQueryParams(value.map((v) => (v.includes('=') ? v : `${v}=true`)))}
      renderInput={(params) => (
        <TextField fullWidth {...params} label="Query Params" placeholder="Enter Additional Query Params" />
      )}
    />
  )
}
