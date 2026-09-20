# Eric · Research Archive — GitHub Pages 版

三维档案首页 + Markdown 项目详情页 + GitHub Actions 自动发布。

## 日常只需要编辑这些文件

| 位置 | 用途 |
| --- | --- |
| `content/projects/*.md` | 一篇 Markdown 对应一个档案和一个详情页 |
| `content/site.json` | 网站名称、个人简介和三个分组名称 |
| `public/uploads/` | 项目图片、PDF 等文件 |
| `content/project-template.md` | 新项目模板，复制到 projects 文件夹后使用 |

`content/archives.json` 是自动生成的目录，不要手动修改。当前保留 24 篇占位档案，你可以直接替换、隐藏或删除。

## 第一次部署到 GitHub

1. 创建或指定一个仓库，以 `main` 为默认分支。个人主页仓库可以叫 `你的用户名.github.io`；也可以使用 `research-archive` 等普通仓库名。
2. 把本项目根目录的源文件上传到仓库根目录，务必包含 `.github/workflows/pages.yml`、`package.json`、`package-lock.json`、`content`、`src`、`public`、`scripts` 和 `vite.config.ts`。不要上传 ZIP 文件本身作为网站，也不要上传 `node_modules`。
3. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
4. 打开 **Actions → Publish research archive → Run workflow**，或向 `main` 提交一次修改。
5. 等待 build 和 deploy 两个任务成功；Pages 设置页与部署任务会显示实际网址。

根域名主页一般是 `https://你的用户名.github.io/`，普通仓库是 `https://你的用户名.github.io/仓库名/`。项目使用相对资源路径，两种形式都支持。

GitHub Free 支持公开仓库的 Pages；私有仓库的 Pages 可用性取决于账号套餐。GitHub Pages 网站通常对公众开放，私有仓库不等于私有网站。草稿会从发布的网站中排除，但如果源码仓库是公开的，草稿 Markdown 仍然可以在仓库中被阅读。

## 不安装开发工具，直接用 GitHub 网页维护

### 修改项目

进入 `content/projects`，点开某个 `.md` 文件，点击铅笔图标 **Edit this file**。改完后提交 **Commit changes** 到 `main`，网站会自动重新构建并发布。如果仓库要求 Pull Request，就按仓库规则合并后发布。

顶部是项目属性，下面是正文：

```markdown
---
title: "我的项目"
subtitle: "MY RESEARCH PROJECT"
group: 1
order: 10
date: "2026"
summary: "一句话说明项目目标与成果。"
cover: ""
draft: false
---

## 项目背景

这里填写正文。

## 我的贡献

- 第一项贡献。
- 第二项贡献。

## 结果

这里填写实验或仿真结果。
```

| 属性 | 含义 |
| --- | --- |
| `title` | 必填，中文或英文标题 |
| `subtitle` | 英文副标题，可为空 |
| `group` | 必填，1、2 或 3，对应 site.json 的三个分组 |
| `order` | 同组排序，越小越靠前；同值按文件名排序 |
| `date` | 日期文字，建议始终加引号 |
| `summary` | 首页摘要与详情页导语 |
| `cover` | 可选封面，例如 `uploads/my-project.jpg`；留空使用占位图 |
| `draft` | `true` 隐藏，`false` 发布；只用英文小写布尔值 |

### 新增项目

1. 复制 `content/project-template.md` 的内容。
2. 在 `content/projects` 使用 **Add file → Create new file**，命名为 `my-project.md`。文件名只用小写英文、数字和短横线。
3. 填写内容，把 `draft: true` 改为 `draft: false` 后提交。

该项目自动出现在首页，其独立地址为 `网站地址/projects/my-project/`。不用改菜单、路由或三维代码。每个分组支持 0–20 篇项目；空分组自动隐藏，超过八篇时数字保持单排并可横向滚动。全部项目删除或隐藏后会显示空状态。

### 删除或暂时隐藏项目

- 删除对应 `.md` 文件并提交，首页和生成的详情页都会移除。
- 如果只是暂时下线，将 `draft` 改为 `true`。
- 删除前，清理其他 Markdown 中指向它的链接。发现失效的内部链接时构建会停止，旧网站继续保留。
- 文件名就是链接地址的一部分；改标题不会改变地址，重命名文件会改变地址，旧链接不会自动重定向。

### 添加图片、PDF 和其他项目链接

先将文件上传到 `public/uploads/`，建议使用英文文件名，然后在正文中写：

```markdown
![实验装置](uploads/experiment.jpg)

[下载报告](uploads/report.pdf)

[另一个项目](archive-02.md)

[代码仓库](https://github.com/你的用户名/仓库名)
```

本地图片支持 PNG、JPEG、WebP、GIF、AVIF。Markdown 支持标题、段落、粗体、列表、表格、代码块和链接。正文中的 HTML 会清理，不能用它执行脚本。请上传已获准公开的图片和材料。

## 修改首页简介或分组名

编辑 `content/site.json`。`groups` 保持三个不同的名称；项目通过数字 group 引用它们，因此改分组名称不必逐篇修改项目。

## 本地预览（可选）

安装 Node.js 24 后，在项目目录运行：

```bash
npm ci
npm run dev
```

终端会显示本地地址。修改 Markdown 后首页自动更新。完整构建与静态预览：

```bash
npm run check:content
npm run build
npm run preview
```

构建产物在 `dist/`。不建议直接双击 HTML 文件，因为三维模型需要通过 HTTP 加载。

## 部署失败时

- 在 Actions 中打开失败的任务，检查报错文件名；常见原因是 YAML 引号、group 数字、图片路径或内部链接。
- 确保 Pages 的 Source 是 GitHub Actions，默认分支是 main。
- 如果组织限制 Actions 或部署权限，需要管理员允许相应工作流；项目不会自行绕过这些限制。
- 新构建失败不会自动覆盖上一次成功发布的网站。

## 技术结构

- 首页：Vite、TypeScript、Three.js，保留三维档案交互。
- 内容：Markdown + YAML 元数据，构建时生成目录和真实 HTML 详情页。
- 详情页：无服务器、无数据库，刷新独立网址不会依赖 SPA 路由回退。
- 发布：GitHub Actions 安装锁定依赖，验证内容，构建后发布 dist。
- 内容管理：通过 GitHub 登录后的编辑权限进行，不在公开网页中保存访问令牌或提供写入接口。

本版本准备了全部源码与自动部署工作流，实际是否已上线以 GitHub Actions 的成功结果为准。

## 来源与许可

三维档案交互基于 [RhineLabUI / LBEILC](https://github.com/LBEILC/RhineLabUI)，保留根目录 LICENSE 与 public/licenses 中的授权、署名文件。

官方部署资料：[GitHub Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Vite 静态部署](https://vite.dev/guide/static-deploy.html#github-pages)。
