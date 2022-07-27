import { Octokit } from 'octokit'
import { Storage } from '@plasmohq/storage'

const getOctoKit = async (): Promise<Octokit> => {
  const storage = new Storage()
  const auth = await storage.get('githubPrivateToken')
  const octokit = new Octokit({ auth })
  return octokit
}
// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo

export const getSpecFiles = async (): Promise<Array<string>> => {
  try {
    const octokit = await getOctoKit()
    const response = await octokit.rest.repos.getContent({
      owner: 'wix-private',
      repo: 'thunderbolt',
      path: 'petri-specs',
    })

    const data = response.data as Array<{ name: string }>
    const specs = new Set<string>(data.map(({ name }) => name.replace(/\.json$/, '')))

    return [...specs]
  } catch (error) {
    console.error(error)
    return []
  }
}
