import { Autocomplete, Button, FormControl, InputLabel, TextField } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useStorage } from '@plasmohq/storage'
import { getSpecFiles } from '~utils/github'

export const Experiments = () => {
  const [experiments, setExperiments] = useStorage<Array<string>>('experiments', [])

  const [currentExperiments, setCurrentExperiments] = useState([] as Array<string>)
  const [value, setValue] = useState<string>(undefined)
  const experimentsInUrl = useRef(null)
  useEffect(() => {
    Promise.all([chrome.tabs.query({ active: true, currentWindow: true }), getSpecFiles()]).then(
      ([[tab], specFiles]) => {
        if (tab) {
          experimentsInUrl.current = new URL(tab.url).searchParams.get('experiments')?.split(',') ?? []
          setCurrentExperiments(experimentsInUrl.current.concat(specFiles))
        } else {
          setCurrentExperiments(specFiles)
        }
      }
    )
  }, [])

  const options = currentExperiments.filter((e) => !experiments.includes(e))

  return (
    <Autocomplete
      multiple
      ChipProps={{
        onClick: (event) => {
          // const target = event.target as HTMLSpanElement
          // setValue(target.textContent)
          // setExperiments(experiments.filter((e) => e !== target.textContent))
        },
      }}
      limitTags={2}
      freeSolo
      options={options}
      value={experiments}
      onChange={(__, value) => setExperiments(value)}
      renderInput={(params) => (
        <FormControl fullWidth sx={{ display: 'flex', flexDirection: 'row', columnGap: 1 }}>
          <TextField
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
            }}
            {...params}
            label="Experiments"
            placeholder="Experiments"
          />
        </FormControl>
      )}
    />
  )
}
