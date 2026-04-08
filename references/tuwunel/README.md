# Tuwunel — 参考指南

## 官方资源
- GitHub：https://github.com/matrix-construct/tuwunel
- 文档：仓库内 README + tuwunel-example.toml
- Docker：`ghcr.io/matrix-construct/tuwunel:latest`

## 核心概念
Tuwunel 是 Rust 编写的 Matrix homeserver，Conduit/conduwuit 的官方继任者。
单二进制 + 内嵌 RocksDB，轻量高性能。瑞士政府生产部署。

## 最小配置 (tuwunel.toml)
```toml
[global]
server_name = "ottie.app"
database_path = "/var/lib/tuwunel"
port = 8008
allow_registration = true
allow_federation = true
```

## 配合 Caddy 部署
```
ottie.app, ottie.app:8448 {
    reverse_proxy localhost:8008
}
```

## Docker Compose
```yaml
services:
  tuwunel:
    image: ghcr.io/matrix-construct/tuwunel:latest
    volumes:
      - ./tuwunel.toml:/etc/tuwunel/tuwunel.toml
      - tuwunel-data:/var/lib/tuwunel
    ports:
      - "8008:8008"

  caddy:
    image: caddy:latest
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
    ports:
      - "443:443"
      - "8448:8448"

volumes:
  tuwunel-data:
```

## SSO/OIDC 配置
Tuwunel 支持 Google、GitHub 等 OIDC 提供商登录。
配置 client_id、client_secret、callback_url 即可。

## 联邦
开启 `allow_federation = true` 后，不同域名的 Tuwunel 服务器自动互通。
不需要预配置或签协议。

## 注意
- server_name 设置后不可更改
- 不要用子域名作为 server_name（可以后续用 .well-known 委托）
- 不要在不同 Conduit fork 之间切换（数据库会损坏）
- 跟踪 :latest 标签自动更新
