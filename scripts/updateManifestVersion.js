const {writeFileSync} = require('fs')
const manifestPath = require.resolve('../manifest.json')
const manifest = require('../manifest.json');
const semver = /(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/

const {groups: {major, minor, patch}} = semver.exec(manifest.version)

const newVersion = `${major}.${minor}.${parseInt(patch) + 1}`
writeFileSync(manifestPath, JSON.stringify({...manifest, version: newVersion}, null, 2))

