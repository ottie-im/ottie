const { getDefaultConfig } = require('expo/metro-config')

// Mobile 是独立 app（不在 monorepo workspace 里）
// 使用 Expo 默认配置即可
module.exports = getDefaultConfig(__dirname)
