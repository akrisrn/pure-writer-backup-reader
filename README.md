# PureWriter backup reader

用于将纯纯写作（PureWriter）的备份文件转换为更适合存放在 GitHub 的纯文本形式的脚本。

## 特性

- 根据书籍、卷的目录关系生成文件。
- 实时监听目录，取最新备份文件更新。
- 有一些自动化 Git 操作。
- 可以从 WebDav 读取备份。

### Todo

- [ ] 集成 GitHub Action。

## 依赖

- node.js
- pnpm（换成 npm、yarn 也行，只不过这里没有它们的 lock 文件）
- git（非必需）

## 运行

```shell
pnpm install
pnpm run build
pnpm run start
```

对了，运行前还需要根据实际情况配置几个环境变量。

## 环境变量

所有的环境变量都存放在根目录下的 `.env` 文件中，你可以将它复制一份改名为 `.env.local` 再做修改。

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| BACKUPS_PATH | 含有 `.pwb` 文件的目录路径，如果启用了 WebDav，则会作为 WebDav 路径使用。 | `/PureWriter/Backups` |
| TARGET_PATH | 用于输出文件的目录路径，注意它会在每次更新前清空。 | `PureWriter` |
| WATCH | 是否持续监听目录下的文件更新，如果启用了 WebDav，则为定时检查。 | `true` |
| INTERVAL | 两次更新之间的最小时间间隔，单位毫秒。 | `600000` |
| ENABLE_GIT | 是否启用 Git 操作。 | `true` |
| WEB_DAV | 是否启用 WebDav。 | 空 |
| WEB_DAV_URL | WebDav 地址。 | 空 |
| WEB_DAV_USERNAME | WebDav 用户名。 | 空 |
| WEB_DAV_PASSWORD | WebDav 密码。 | 空 |
