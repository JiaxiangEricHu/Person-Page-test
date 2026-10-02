# Eric · Research Archive — GitHub Pages 版

三维档案首页 + Markdown 项目详情页 + GitHub Actions 自动发布。

## 可视化编辑与集中配置

**完整源码已整理在本仓库。** 常用元素不需要进入 Three.js 代码修改：

| 要改什么 | 直接编辑 |
| --- | --- |
| 姓名、简介、品牌、分类列、标签和联系按钮 | [site.json](content/site.json) |
| 标题、按钮、操作提示、页脚、空状态文字 | [ui.json](content/ui.json) |
| 全站颜色、字体、面板尺寸、圆角、模糊、显示开关 | [design.json](content/design.json) |
| 档案比例、露出量、材质颜色、波浪、滚轮和性能参数 | [scene.json](content/scene.json) |
| 自动发布开关 | [publishing.json](content/publishing.json) |
| 项目内容、标题、封面、排序和上下线 | [项目 Markdown](content/projects/) |
| 图片、PDF、其他附件 | [public/uploads](public/uploads/) |
| 更细的页面布局与样式覆盖 | [custom.css](public/custom.css) |

**表单编辑器：** Pages 发布成功后，访问网站的 `editor.html`。本地则运行 `npm ci` 后 `npm run edit`。表单可导入现有 JSON、填写中文标注的选项，并导出当前类别的 JSON。将导出文件替换到仓库 `content/` 中的同名文件后提交，即可触发重新构建。

编辑器在浏览器内工作，**不会直接写入 GitHub，也不是实时预览器**；尚未导出的修改会在刷新后丢失。需要即时查看效果时，修改本地配置并运行 `npm run dev`。

[中文编辑地图](EDITING_GUIDE_ZH.md) · [全部配置参数](CONFIG_REFERENCE_ZH.md)

## 发布与不发布由你控制

| 操作 | 结果 |
| --- | --- |
| `content/publishing.json` → `autoPublish: true` | main 提交通过检查后自动发布 |
| `autoPublish: false` | 提交仍检查和构建，线上保留上一次版本 |
| Actions → Publish research archive → Run workflow，勾选 `publish` | 手动发布 main，即使自动发布关闭 |
| 手动运行时取消勾选 `publish` | 只验证构建，不发布 |
| Settings → Pages → 当前站点右侧菜单 → Unpublish site | 整站下线，仓库文件保留；下一次成功部署会恢复网站 |
| 项目 `draft: true` / 分类 `enabled: false` | 下一次发布时排除该项目 / 整列及其详情页 |

若希望整站持续下线，先关闭自动发布，再 Unpublish，避免后续提交重新上线。关闭自动发布本身不会撤掉现有网站。公开仓库里的草稿和图片仍可被阅读；这不是访问密码或权限管理。

## 可调列数、行数与分类盒

[打开编辑器](https://jiaxiangerichu.github.io/Person-Page-test/editor.html) → 个人资料 → 分类列，可以增删、排序、启停列。`visibleRows` 决定同时渲染的行数（1–48），项目总数来自该列 Markdown 文件。每列按自身项目数量循环，实际内容数与渲染行数互不绑定。

```json
{
  "id": "semiconductor",
  "name": "半导体",
  "keywords": ["SEMICONDUCTORS", "器件 · 微电子"],
  "logo": "uploads/semiconductor-logo.png",
  "color": "#c7a66e",
  "visibleRows": 8,
  "enabled": true
}
```

项目顶部填写 `group: semiconductor`。Logo 支持 PNG、JPEG、WebP、GIF、AVIF 和 SVG，先上传到 `public/uploads/`，没有 Logo 就填空字符串。ID 应保持稳定，改 ID 或删除列时需同步调整其中项目。空列自动隐藏；新增列后，至少添加一篇 `draft: false` 的项目才能显示。现有“半导体 / PCB / 研究与设计”是示范分类，24 篇项目仍是待替换的占位内容。

分类盒现在使用**无磨砂盖的清晰顶面标签**。前板从顶板下沿一直延伸到地面，两侧沿档案列延伸到最后一行之后，形成包住该列档案的盒身。顶面文字使用高对比度印刷面，没有透明盖层压在文字上。

- `categoryBoxElevation`：顶板离地高度（默认 3.2），盒身随高度自动伸到地面。
- `categoryBoxHeight`：顶板本身的厚度，与向下延伸的盒身高度分开。
- `categoryBoxSideExtension`：顶板及盒身左右每侧的延展量（默认 0.4），总宽受列间距限制。
- `categoryBoxRearExtension`：侧板覆盖显示行之后，继续向列后方延展的长度（默认 0.8）。
- `categoryBoxLogoScale`：盒身前面及两侧的 Logo 比例（默认 0.72）。
- 每列 `logo` 图片会同时显示在顶面、前板和左右侧板。图片只加载一次；没有图片时以分类名称展示。Logo 支持 PNG、JPEG、WebP、GIF、AVIF、SVG，填写如 `uploads/pcb-logo.svg`。

盒子的顶板、盒身和 Logo 保持固定高度、尺寸与前后位置，档案在盒内循环；横向切换列时，整组盒子与档案一起平移。展开项目时隐藏分类盒；预览面板始终显示当前分类。几何、材质、文字布局在 `src/category-boxes.ts`，常用尺寸在 `scene.json` 和编辑器的「三维与动画」中调整。原分类盒磨砂盖的透明度、粗糙度参数已移除。

`lightweightGeometry: true` 默认使用共享的低面数程序几何，无需请求两份 GLB；关闭则使用保留的原模型。轻量模式也关闭环境遮蔽并降低阴影分辨率；默认关闭景深。减少每列 `visibleRows`、像素比或景深可以继续降低负载。效果以设备实际运行结果为准。

## 从这里开始修改

- **原网站（独立的 ChatGPT Sites 版本）**：[Eric · Research Archive](https://eric-research-archive.erichu996.chatgpt.site/)
- **修改姓名、简介和分组**：[编辑 site.json](https://github.com/JiaxiangEricHu/Person-Page-test/edit/main/content/site.json)
- **修改项目和详情页**：[打开 projects 文件夹](content/projects/)，选择文件后点击铅笔。
- **上传图片与 PDF**：[打开 uploads 文件夹](public/uploads/)。
- **界面与源码对应位置**：[中文编辑地图](EDITING_GUIDE_ZH.md)。

本仓库补齐了此前打包的 GitHub Pages 可编辑版本（2026-09-20 导出），含完整前端源码、模型资源、24 篇占位项目及 Markdown 详情页。它是原 Sites 项目的独立可编辑版本，并非从线上页面反编译的文件；此版本继续以该导出包为基线开发，包含新的集中配置与编辑器；没有更新原 Sites 发布。

**修改这里不会自动更新上面的 chatgpt.site 网址。** GitHub Actions 工作流发布的是 GitHub Pages；需先在仓库 Settings → Pages 将 Source 设为 GitHub Actions。Pages 地址为 [研究档案网站](https://jiaxiangerichu.github.io/Person-Page-test/)，最新版本是否成功上线请以 [Actions](https://github.com/JiaxiangEricHu/Person-Page-test/actions) 的实际部署结果为准。


## 日常只需要编辑这些文件

| 位置 | 用途 |
| --- | --- |
| `content/projects/*.md` | 一篇 Markdown 对应一个档案和一个详情页 |
| `content/site.json` | 网站名称、个人简介和分类列名称 |
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

进入 `content/projects`，点开某个 `.md` 文件，点击铅笔图标 **Edit this file**。改完后提交 **Commit changes** 到 `main`，网站会重新构建，是否自动发布由 publishing.json 控制。如果仓库要求 Pull Request，就按仓库规则合并后发布。

顶部是项目属性，下面是正文：

```markdown
---
title: "我的项目"
subtitle: "MY RESEARCH PROJECT"
group: group-01
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
| `group` | 必填，填写 site.json 中对应列的固定 ID，如 group-01 |
| `order` | 同组排序，越小越靠前；同值按文件名排序 |
| `date` | 日期文字，建议始终加引号 |
| `summary` | 首页摘要与详情页导语 |
| `cover` | 可选封面，例如 `uploads/my-project.jpg`；留空使用占位图 |
| `draft` | `true` 隐藏，`false` 发布；只用英文小写布尔值 |

### 新增项目

1. 复制 `content/project-template.md` 的内容。
2. 在 `content/projects` 使用 **Add file → Create new file**，命名为 `my-project.md`。文件名只用小写英文、数字和短横线。
3. 填写内容，把 `draft: true` 改为 `draft: false` 后提交。

该项目自动出现在首页，其独立地址为 `网站地址/projects/my-project/`。不用改菜单、路由或三维代码。每个分组的项目数量可不同，已移除 20 篇上限；空分组自动隐藏，超过八篇时数字保持单排并可横向滚动。全部项目删除或隐藏后会显示空状态。

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

编辑 `content/site.json`。`groups` 可以配置 1–12 列；每列拥有固定 id、name、keywords、logo、color、visibleRows 和 enabled。项目通过固定 group ID 关联列，改名称、调整顺序不必逐篇修改项目。

## 本地预览（可选）

安装 Node.js 24 后，在项目目录运行：

```bash
npm ci
npm run dev
```

终端会显示本地地址。修改 Markdown 后首页自动更新。完整构建与静态预览：

```bash
npm run check:config
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

模型采用小文件打包随仓库存储，安装或构建时自动恢复到 public/assets；恢复过程验证 SHA-256，无需从第三方服务器下载模型。替换模型的方法见 [assets-source/README.md](assets-source/README.md)。

本版本包含完整源码与自动部署工作流，实际是否已上线以 GitHub Actions 的成功结果为准。

## 来源与许可

三维档案交互基于 [RhineLabUI / LBEILC](https://github.com/LBEILC/RhineLabUI)，保留根目录 LICENSE 与 public/licenses 中的授权、署名文件。

官方部署资料：[GitHub Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Vite 静态部署](https://vite.dev/guide/static-deploy.html#github-pages)。
