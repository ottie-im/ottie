const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.projectRoot = projectRoot

// 监听 monorepo 根目录（EAS 云端需要）
config.watchFolders = [monorepoRoot]

// 解析优先从 mobile 自己的 node_modules，然后是根目录
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// 关键：强制 react 和 react-native 从 mobile 目录解析，防止双实例
// 但只有当 mobile 目录下确实有这些包时才生效
const forceLocal = ['react', 'react-native', 'react/jsx-runtime']
config.resolver.extraNodeModules = {}
for (const pkg of forceLocal) {
  const localPath = path.resolve(projectRoot, 'node_modules', pkg)
  try {
    require.resolve(localPath)
    config.resolver.extraNodeModules[pkg] = localPath
  } catch {
    // 如果 mobile 没有本地副本（被 hoist 了），就不强制
  }
}

module.exports = config
