const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Set project root to THIS directory, not the monorepo root
config.projectRoot = projectRoot

// Watch monorepo for shared packages, but resolve from here
config.watchFolders = [monorepoRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// Prevent hoisted packages from being resolved to monorepo root
config.resolver.disableHierarchicalLookup = true

module.exports = config
