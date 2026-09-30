# 网站编辑地图

## 修改入口

先阅读根目录 README 的集中配置表。网站入口为 index.html，表单编辑器为 editor.html。

- 最常用：content/site.json、ui.json、design.json、scene.json。
- 编辑器是导入/导出工具；导出后还需替换仓库中的文件并提交。它不直接更改线上网站。
- JSON 编辑器会读取 content/schemas 的字段说明；每个配置字段的中文含义、范围、默认值见 CONFIG_REFERENCE_ZH.md。
- 颜色使用 #RRGGBB；长度单位在参数名称或说明中标明。配置错误会阻止构建并显示字段名。
- 三个分组是当前三维模型的设计约束；每组最多 20 篇。修改分组数量、模型拓扑或增加新交互仍需改源码。
- 数据展示、样式、几何与交互均保留源文件；“易修改”不代表任意重新设计都只需配置。

## 内容修改

| 你想修改的内容 | 对应文件 | 操作 |
| --- | --- | --- |
| 网站标题、姓名、品牌、简介、三个分组 | [content/site.json](content/site.json) | 修改字符串，保留 JSON 双引号及逗号 |
| 第一张档案及其详情 | [content/projects/archive-01.md](content/projects/archive-01.md) | 修改顶部属性和下面 Markdown 正文 |
| 其他档案及详情 | [content/projects/](content/projects/) | 一篇文件对应一张档案和一个详情页 |
| 新增档案 | [content/project-template.md](content/project-template.md) | 复制到 projects 下，使用新文件名，设置 draft: false |
| 隐藏档案 | 对应项目 Markdown | 设置 draft: true；公开仓库里源码仍可见 |
| 删除档案 | 对应项目 Markdown | 删除文件，同时修正引用它的链接 |
| 图片或 PDF | [public/uploads/](public/uploads/) | 上传后在正文使用 uploads/文件名 |

## 界面与实现

| 区域或功能 | 对应源码 |
| --- | --- |
| 页面入口与交互协调 | [src/main.ts](src/main.ts) |
| 个人档案样式 | [src/personal.css](src/personal.css) |
| 小屏幕布局 | [src/responsive.css](src/responsive.css) |
| 档案尺寸 | [src/archive-dimensions.ts](src/archive-dimensions.ts) |
| 三维场景 | [src/scene.ts](src/scene.ts) |
| 三维模型 | [public/assets/](public/assets/) |
| Markdown 读取与详情页生成 | [scripts/content.mjs](scripts/content.mjs) |
| 详情页样式 | [public/project.css](public/project.css) |
| 静态构建配置 | [vite.config.ts](vite.config.ts) |
| GitHub Pages 自动发布 | [.github/workflows/pages.yml](.github/workflows/pages.yml) |

content/archives.json 是自动生成文件，不作为日常编辑入口。24 篇现有项目为占位内容，请填写真实项目后发布。不要把密钥或未获准公开的材料写入这个公开仓库。

## 最简维护流程

1. 打开上面的内容文件，点击 GitHub 铅笔图标。
2. 修改并点击 Commit changes 保存到 main。
3. 查看 Actions。工作流会校验内容并构建；Pages 设置完成后自动发布。
4. 原 chatgpt.site 网站与 GitHub Pages 分别发布，互不自动同步。

如需本地运行：安装 Node.js 24，在本目录依次执行 npm ci 和 npm run dev。完整验证运行 npm run check:content 与 npm run build。

## 逐区域自定义样式

在 public/custom.css 添加 CSS，首页、项目列表和详情页都会加载它。

| 页面区域 | CSS 选择器 |
| --- | --- |
| 顶部品牌与导航 | header、.brand、.header-right |
| 简介面板 | .intro-panel、.intro-topics、.contact-link |
| 预览面板与缩略图 | .preview-panel、.preview-summary、.preview-image、.preview-copy |
| 档案编号与分组按钮 | #row-ticks button、#columns button、.column-nav |
| 三维展开后的说明面板 | .details、.detail-image、.read-project |
| 加载、空状态与页脚 | .loading、.empty-state、footer |
| 项目列表 | .project-list |
| 独立项目正文 | .project-article、.project-summary、.project-cover |
| 独立详情的页眉与页脚 | .project-header、.project-article footer |

手机使用 `@media (max-width:700px) { ... }`。例如：

```css
/* 调整简介位置 */
@media (min-width:701px) {
  .info-stack { top: 120px; }
}
/* 只修改详情页的小标题 */
.project-article h2 { color: var(--accent); }
```

公用颜色会应用到首页及详情页；显示开关针对首页对应面板。手机紧凑布局会限制部分桌面参数，例如品牌字号最大 30px、简介和预览的内边距使用较紧凑值。高级调整通过 custom.css 完成。

## 三维资源与封面

- cover 属性既用于页面缩略图，也用于选中档案的三维标签；未提供封面时使用原占位图形。
- public/favicon.svg 是浏览器图标，可直接替换。
- public/assets 下的模型可替换，但需保留网格/材质命名与原始尺寸基准。模型宽度固定为 5 个场景单位，避免破坏既有间距。
- 三维材质和场景参数：content/scene.json；复杂着色器：src/theme-material.ts、src/appearance.ts。
- 动画细节：src/scene.ts、src/motion.ts；拖拽惯性：src/archive-drag.ts；相机响应式构图：src/viewport-layout.ts。
- public/theme.css 与 content/archives.json 均自动生成，请修改对应配置而非生成结果。

## 验证并发布

```bash
npm ci
npm run check:config
npm run check:content
npm run build
npm run preview
```

自动部署读取 main 分支，需先在 GitHub Settings → Pages 将 Source 设为 GitHub Actions。GitHub Pages 与原 chatgpt.site 为独立网站，不自动互相更新。
