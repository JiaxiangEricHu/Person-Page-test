# 全部配置参数

常用配置位于 content 下五个 JSON 文件。浏览器 editor.html 提供表单，导出后提交到 GitHub 生效。

## 分类列字段

`site.groups` 为 1–12 个分类对象。每列可以有不同数量的项目，按各自项目总数循环。`visibleRows` 为同时渲染行数（1–48），与项目总数独立。空列和 enabled: false 的列不生成页面。固定 ID 与 Markdown 的 group 关联，调整名称或顺序不改变关联。

| 字段 | 用途 |
| --- | --- |
| id | 唯一固定 ID，如 semiconductor |
| name | 分类名称 |
| keywords | 关键词数组，盒面展示前两行 |
| logo | uploads/logo.png，可留空 |
| color | 底座和标签强调色 |
| visibleRows | 显示行数，1–48 的整数 |
| enabled | 发布该列及其项目 |

## site.json

| 字段 | 中文含义 | 默认值 | 范围/说明 |
| --- | --- | --- | --- |
| `title` | 网站标题 | `"Eric · Research Archive"` | 网站标题 |
| `name` | 姓名 | `"Eric Hu"` | 姓名 |
| `brand` | 左上角品牌 | `"ERIC"` | 左上角品牌 |
| `description` | 个人简介 | `"关注微电子、可穿戴设备与生物传感，探索从器件到系统的研究与设计。"` | 个人简介 |
| `groups` | 分类列 | `见 site.json` | 增删或排序列；用固定 ID 关联项目，每列独立设置显示行数、关键词与 Logo。 |
| `topics` | 研究标签 | `["Microelectronics", "Wearables", "Biosensing"]` | 每行一个；可以清空。 |
| `contactLabel` | 联系按钮文字 | `""` | 为空时不显示。 |
| `contactUrl` | 联系按钮地址 | `""` | 支持 https:// 或 mailto:；为空时不显示。 |

## ui.json

| 字段 | 中文含义 | 默认值 | 范围/说明 |
| --- | --- | --- | --- |
| `brandSubtitle` | 品牌下方副标题 | `"PERSONAL RESEARCH\nARCHIVE SYSTEM"` | 品牌下方副标题 |
| `brandSymbol` | 品牌符号 | `"↗"` | 品牌符号 |
| `collection` | 总数前缀 | `"COLLECTION"` | 总数前缀 |
| `allProjects` | 项目列表入口 | `"全部项目"` | 项目列表入口 |
| `about` | 简介栏目标题 | `"ABOUT / 简介"` | 简介栏目标题 |
| `selected` | 选中档案栏目标题 | `"SELECTED ARCHIVE"` | 选中档案栏目标题 |
| `detailEyebrow` | 展开卡片栏目标题 | `"PERSONAL RESEARCH ARCHIVE"` | 展开卡片栏目标题 |
| `open` | 展开按钮 | `"展开档案"` | 展开按钮 |
| `read` | 完整详情按钮 | `"阅读完整项目 ↗"` | 完整详情按钮 |
| `back` | 返回按钮 | `"← 返回档案阵列"` | 返回按钮 |
| `hint` | 操作提示 | `"横向切组 · 纵向选档"` | 操作提示 |
| `hintSecondary` | 操作提示第二行 | `"点击编号可直接选择"` | 操作提示第二行 |
| `footerLeft` | 页脚左侧 | `"ERIC / RESEARCH ARCHIVE"` | 页脚左侧 |
| `footerRight` | 页脚右侧 | `"PERSONAL RESEARCH"` | 页脚右侧 |
| `loading` | 加载提示 | `"正在载入档案阵列"` | 加载提示 |
| `loadError` | 三维载入失败提示 | `"当前浏览器无法启动三维场景。"` | 三维载入失败提示 |
| `fallback` | 降级浏览入口 | `"直接浏览全部项目"` | 降级浏览入口 |
| `emptyTitle` | 空列表标题 | `"暂无公开项目"` | 空列表标题 |
| `emptyDescription` | 空列表说明 | `"新的研究档案即将上线。"` | 空列表说明 |
| `sceneLabel` | 三维区域辅助标签 | `"三维档案阵列"` | 三维区域辅助标签 |
| `rowsLabel` | 编号区域辅助标签 | `"列内档案"` | 编号区域辅助标签 |
| `groupsLabel` | 分组区域辅助标签 | `"档案分组"` | 分组区域辅助标签 |
| `previousGroup` | 上一组按钮辅助标签 | `"上一组"` | 上一组按钮辅助标签 |
| `nextGroup` | 下一组按钮辅助标签 | `"下一组"` | 下一组按钮辅助标签 |
| `openSelected` | 卡片辅助标签 | `"展开当前档案"` | 卡片辅助标签 |
| `selectPrefix` | 档案按钮辅助前缀 | `"选择"` | 档案按钮辅助前缀 |

## design.json

| 字段 | 中文含义 | 默认值 | 范围/说明 |
| --- | --- | --- | --- |
| `background` | 背景 | `"#07090b"` | 背景 |
| `text` | 主要文字 | `"#e8e8e4"` | 主要文字 |
| `muted` | 次要文字 | `"#9aa5ac"` | 次要文字 |
| `accent` | 强调色 | `"#c7a66e"` | 强调色 |
| `line` | 边框基础色 | `"#ccd8df"` | 边框基础色 |
| `panel` | 玻璃面板底色 | `"#101722"` | 玻璃面板底色 |
| `cardPaper` | 档案标签纸色 | `"#f1eee6"` | 档案标签纸色 |
| `cardImage` | 档案缩略图底色 | `"#deded1"` | 档案缩略图底色 |
| `cardGrid` | 标签网格 | `"#bdc2b1"` | 标签网格 |
| `cardGraph` | 标签曲线 | `"#394731"` | 标签曲线 |
| `cardText` | 标签标题 | `"#252821"` | 标签标题 |
| `cardSubtitle` | 标签副标题 | `"#3b4137"` | 标签副标题 |
| `placeholder` | 占位缩略图 | `"#6a7958"` | 占位缩略图 |
| `fontFamily` | 界面字体 | `"Arial, \"PingFang SC\", \"Microsoft YaHei\", sans-serif"` | 填写 CSS 字体族列表；字体须已在浏览器安装或另行引入。 |
| `bodySize` | 正文大小 px | `16` | 正文大小 px；14–24 |
| `titleSize` | 预览标题 px | `24` | 预览标题 px；18–36 |
| `brandSize` | 桌面品牌字号 px | `38` | 桌面品牌字号 px；20–52 |
| `panelWidth` | 桌面侧栏最大宽度 px | `350` | 桌面侧栏最大宽度 px；300–420 |
| `panelRadius` | 面板圆角 px | `14` | 面板圆角 px；0–32 |
| `panelPadding` | 面板内边距 px | `22` | 面板内边距 px；12–32 |
| `panelBlur` | 玻璃模糊 px | `24` | 玻璃模糊 px；0–40 |
| `panelOpacity` | 面板不透明度 | `0.65` | 面板不透明度；0.2–1 |
| `previewImageFraction` | 缩略图占卡片宽度比例 | `0.3333333333333333` | 缩略图占卡片宽度比例；0.2–0.5 |
| `numberSize` | 导航数字字号 px | `14` | 导航数字字号 px；12–20 |
| `numberHeight` | 档案编号按钮高度 px | `32` | 档案编号按钮高度 px；28–48 |
| `groupSize` | 分组按钮大小 px | `36` | 分组按钮大小 px；32–48 |
| `contentWidth` | 详情正文最大宽度 px | `860` | 详情正文最大宽度 px；600–1200 |
| `detailBodySize` | 详情正文字号 px | `17` | 详情正文字号 px；16–24 |
| `mobilePreviewHeight` | 手机预览区高度 px | `82` | 手机预览区高度 px；72–130 |
| `showIntro` | 显示简介 | `true` | 显示简介 |
| `showTopics` | 显示研究标签 | `true` | 显示研究标签 |
| `showPreview` | 显示预览面板 | `true` | 显示预览面板 |
| `showNavigation` | 显示导航按钮 | `true` | 显示导航按钮 |
| `showHints` | 显示操作提示 | `true` | 显示操作提示 |
| `showFooter` | 显示页脚 | `true` | 显示页脚 |
| `showCollection` | 显示总数 | `true` | 显示总数 |

## scene.json

| 字段 | 中文含义 | 默认值 | 范围/说明 |
| --- | --- | --- | --- |
| `cardAspect` | 档案高宽比 | `1.4142857142857144` | 档案高宽比；1.1–1.7 |
| `exposedFraction` | 档案露出高度比例 | `0.3333333333333333` | 档案露出高度比例；0.25–0.45 |
| `backgroundWave` | 背景波浪幅度 | `0.78` | 背景波浪幅度；0–1.2 |
| `selectionWave` | 点击波浪幅度 | `0.82` | 点击波浪幅度；0–1.2 |
| `idleWave` | 待机起伏倍率 | `1` | 待机起伏倍率；0–2 |
| `rowDamping` | 纵向切换收敛速度 | `3.7` | 纵向切换收敛速度；2–12 |
| `laneDamping` | 横向切换收敛速度 | `6.2` | 横向切换收敛速度；2–12 |
| `hoverLift` | 悬停抬升高度 | `0.28` | 悬停抬升高度；0–0.5 |
| `wheelRowThreshold` | 滚轮纵向切换阈值 | `100` | 滚轮纵向切换阈值；40–300 |
| `wheelLaneThreshold` | 滚轮横向切换阈值 | `150` | 滚轮横向切换阈值；40–300 |
| `wheelCooldown` | 滚轮切换间隔 ms | `160` | 滚轮切换间隔 ms；80–500 |
| `pixelRatio` | 渲染像素比上限 | `1.5` | 渲染像素比上限；1–2 |
| `depthOfField` | 景深强度 | `0` | 景深强度；0–30 |
| `exposure` | 场景曝光 | `0.98` | 场景曝光；0.5–1.5 |
| `reduceMotion` | 减少动态效果 | `false` | 始终尊重操作系统减少动画设置；此开关可额外减少。 |
| `floor` | 三维地面颜色 | `"#090c0f"` | 三维地面颜色 |
| `fog` | 雾颜色 | `"#0b1014"` | 雾颜色 |
| `polymer` | 档案外壳 | `"#626b70"` | 档案外壳 |
| `edges` | 档案边缘 | `"#687277"` | 档案边缘 |
| `diffuser` | 档案内层 | `"#192226"` | 档案内层 |
| `fasteners` | 档案紧固件 | `"#b1b9bb"` | 档案紧固件 |
| `inlay` | 档案索引 | `"#c6a36b"` | 档案索引 |
| `printedLabel` | 印刷底层 | `"#303a3e"` | 印刷底层 |
| `optics` | 光学内层 | `"#939e9f"` | 光学内层 |
| `opticalEdges` | 透明边缘 | `"#bbc3bc"` | 透明边缘 |
| `ink` | 墨色 | `"#b6bdb8"` | 墨色 |
| `lightweightGeometry` | 轻量模型 | `true` | 使用程序生成的低面数卡片，免加载 GLB。 |
| `showCategoryBoxes` | 显示分类盒 | `true` | 显示清晰顶面标签，以及向下、沿列延伸的分类盒身。 |
| `categoryBoxWidth` | 分类盒宽度 | `4.3` | 三维场景中的盒子宽度。；2–4.8 |
| `categoryBoxDepth` | 分类盒深度 | `2.3` | 增加深度可容纳更大关键词面板。；1–4 |
| `categoryBoxHeight` | 分类盒顶板厚度 | `0.48` | 顶部标签底板的厚度；盒身自动向下延伸至地面。；0.2–1 |
| `categoryBoxGap` | 分类盒与阵列间距 | `0.6` | 盒子与最外侧一行的间距。；0.2–6 |
| `categoryBoxElevation` | 分类盒抬升高度 | `3.2` | 顶板距地面的固定高度；盒身延伸到地面，不随项目选择、滚动或波浪升降。；0–5 |
| `categoryBoxSideExtension` | 盒身左右延展 | `0.4` | 顶板及盒身每侧增加的宽度；总宽自动限制在列间距内，避免相邻盒子相交。；0–1 |
| `categoryBoxRearExtension` | 侧板向列后方延展 | `0.8` | 侧板覆盖该列显示行后，继续向后延伸的长度。；0–6 |
| `categoryBoxLogoScale` | 盒身 Logo 尺寸 | `0.72` | 前面与两侧的 Logo 显示比例；图片沿用该列的 logo 路径，没有图片时显示分类名称。；0.2–1 |

## publishing.json

| 字段 | 中文含义 | 默认值 | 范围/说明 |
| --- | --- | --- | --- |
| `autoPublish` | 提交后自动发布 | `true` | 关闭后只构建检查，保留当前线上版本。手动发布请在 GitHub Actions 运行工作流并勾选 publish。 |
