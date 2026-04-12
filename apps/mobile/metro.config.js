const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const config = getDefaultConfig(projectRoot)

// 完全隔离：只从 mobile 自己的 node_modules 解析
// 不引入 monorepo 根目录，防止 React 双实例和依赖冲突
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
]

// 不监听 monorepo 根目录
config.watchFolders = []

// 强制指定 React 等核心包的位置，防止 Metro 从别处解析
config.resolver.extraNodeModules = new Proxy(
  {},
  { get: (_, name) => path.resolve(projectRoot, 'node_modules', name) }
)

module.exports = config
