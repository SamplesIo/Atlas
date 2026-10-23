# 贵糖高中 2301 班 · 山海有信

一份关于「高中同学毕业去向」的交互式毕业纪念页。以宣纸、水墨、手绘中国地图为线索，把同窗的去处做成一册可以触摸的班级档案。

整站由 **一个 `class.toml`** 驱动：校名、班级、同学、院校、老师、寄语、页脚文案都在里面。页面在运行时读取它；本地 `bun run serve` 会自动监听并刷新。部署到 GitHub Pages 后，编辑 TOML 仍需通过 Action 重新部署，访客刷新后才能看到新内容。

## 技术栈

- **Bun** + Vite 8 + React 19 + TypeScript
- `d3-geo` 绘制中国省级地图；TopoJSON 生成国家海岸线轮廓
- `smol-toml` 在运行时解析 `class.toml`，并提供友好的错误页
- 纯 CSS 动效 + Three.js 墨尘粒子层 + 轻量微风绳摆：水墨入场、呼吸日光、滚动视差、卡片随绳微动
- 原生 `<dialog>` 承载省份名册，支持键盘与移动端底部抽屉
- 自托管字体子集：Noto Serif SC、Ma Shan Zheng、Cormorant Garamond

## 开始

```bash
bun install
bun run dev
```

构建与检查：

```bash
bun run typecheck
bun run lint
bun run build
bun run preview
```

## 部署到 GitHub Pages

仓库已包含 `.github/workflows/deploy.yml`，推送到 `main` 即可自动构建并部署。

1. 在 GitHub 新建仓库，把项目推送到 `main`：
   ```bash
   git init
   git add .
   git commit -m "init class atlas"
   git branch -M main
   git remote add origin https://github.com/<用户名>/<仓库名>.git
   git push -u origin main
   ```
2. 打开 **Settings → Pages**，把 **Build and deployment → Source** 设为 **GitHub Actions**。
3. 等待 Actions 中的 `Deploy to GitHub Pages` 完成，访问：
   `https://<用户名>.github.io/<仓库名>/`

如果首次运行在 **Configure Pages** 步骤报 `Get Pages site failed` / `HttpError: Not Found`，说明仓库还没有启用 Pages。请先完成上面第 2 步，然后在 Actions 页面点 **Re-run all jobs**。Workflow 已设置 `enablement: true`，在权限允许时也会尝试自动创建 Pages 站点；私有仓库需要 GitHub Pro/Team 或更高套餐才支持 Pages。

Vite 的 base 路径由 workflow 自动计算：

- 仓库名是 `<用户名>.github.io`：部署在根路径 `/`；
- 普通项目仓库：部署在 `/<仓库名>/`；
- 绑定自定义域名时，在 **Settings → Secrets and variables → Actions → Variables** 新建 `VITE_BASE_PATH`，值为 `/`（末尾带斜杠）。

### class.toml 在 GitHub Pages 上能动态更新吗？

可以“准动态”更新，但不是实时后端：

- 前端在运行时 `fetch` 部署目录里的 `class.toml`，所以页面本身不需要为新数据重新写代码。
- GitHub Pages 是纯静态托管，没有常驻服务。你在 GitHub 上修改并提交 `class.toml` 后，上面的 Action 会重新构建、部署；部署完成后访客刷新页面即可看到新数据。
- 本地 `bun run serve 5173` 会监听 `class.toml` 并自动刷新；GitHub Pages 上的已打开页面不会自己更新。
- 若没有触发 Action，或只改了本地的 `class.toml` 而没有推送，线上不会变化。

## 稳定预览

```bash
bun run serve 5173
```

打开 <http://localhost:5173/>。这个本地静态服务直接读取项目根目录的 `class.toml`，并监听文件变化自动刷新页面。修改 `class.toml` 不需要重新构建。

如果部署到普通静态托管（不运行 `scripts/serve.ts`），构建会把当时的 `class.toml` 快照放进 `dist/`；修改数据后需要重新执行 `bun run build`。

## 只改 `class.toml`

根目录的 `class.toml` 是唯一内容源。页面启动时通过 `fetch('/class.toml')` 读取它；保存后 Vite 会自动整页刷新，`bun run serve` 会在约一秒内自动刷新。若 TOML 格式或字段有误，页面会显示具体的错误位置与原因。

### 学校、班级与首页题字

```toml
[school]
name = "贵糖高中"
name_en = "Guitang High School"
class_name = "2301 班"
class_code = "2301"
seal = "贰叁零壹"
```

```toml
[copy]
hero_phrase = "山海有信"
```

- `class_name` 会出现在主标题与页脚。
- `class_code` 用于 `No. 2301`、英文眉题与默认印章。
- `hero_phrase` 是首页的大字题词，默认“山海有信”；可自行替换。
- `seal` 可省略；四位中文数字最适合印章。

### 同学去向

按学生逐条添加，同一省份会自动聚合到同一张卡片、地图上的同一个标签：

```toml
[[students]]
province = "广西"      # 支持「广西」或「广西壮族自治区」
name = "韦雄耀"
university = "南宁职业技术大学"
```

增删 `[[students]]`，统计数字、省份数、高校数、地图标注都会自动更新。添加一个尚未出现的省份时，地图标注会自动重新排布。

### 老师与各科寄语

老师名字与科目会出现在首屏“恩师名录”和“各科老师寄语”的纸片中：

```toml
[[teachers]]
subject = "语文"
name = "请输入文本"
message = "请输入文本"   # 纸片上的寄语，可写多句
head_teacher = true      # 有且只能有一位
```

- 每位老师都需要 `message`；这是挂在绳上的那张纸片的内容。
- 班主任会得到一枚“班主任”小标记。
- 删除、增加、调换老师都会同步更新寄语区，绳子与纸片会重新排布。

### 寄语区与结尾文案

```toml
[copy]
letter_title = "写给远行的你们"
letter_aside = "各科老师 · 毕业寄语"
letter_kicker = "见字如晤，展信舒颜。"
letter_body = [
  "此去山高水长，愿你们各有山海，各有归途。",
]
letter_date = "毕业季"
letter_stamp = "贰叁零壹"
letter_seal = "前程似锦"
```

- `letter_title` 是寄语区标题，`letter_aside` 是标题下的小注。
- `letter_body` 显示在绳子末端，作为全体教师的共同留言。
- `letter_stamp` 是右上角的竖排班级印记，`letter_seal` 是落款印章。

文案中支持占位符：

- `{school}` → 校名
- `{class}` → 班级名
- `{classCode}` → 班级编号

多行文案请使用 TOML 的 `"""` 多行字符串；`letter_body` 每一项是一段。

## 地图资源与字体

- 中国省级边界来自 DataV 的公开 GeoJSON，经 `scripts/prepare-map.mjs` 统一环绕方向、拆出南海诸岛，并用 TopoJSON 合并出国家海岸线。
- 如需重建地图数据：`bun run map:build`（源文件在 `scripts/data/china-source.json`）。
- 字体按当前文案裁成 WOFF2 子集，放在 `public/fonts/`；开源许可见同目录 `OFL-*.txt`。如果新增了子集之外的生僻字，浏览器会回退到系统宋体。

## 目录

```
class.toml              ← 唯一内容源
src/data/class-data.ts  ← TOML 解析、校验与派生统计
src/data/provinces.ts   ← 省份 / 大区元数据
src/data/map.ts         ← 投影、自动标注布局
src/components/         ← 页面组件（地图、星散录、绳挂寄语、三维墨尘）
src/styles/             ← 纸张、地图、名录、寄语、弹窗样式
scripts/prepare-map.mjs ← 地图预处理（Bun 可运行）
scripts/serve.ts        ← 构建产物的本地静态服务器
scripts/data/           ← 地图原始数据
```

## 说明

人物、院校与去向均为虚构示例，仅作班级纪念页设计使用；地图边界仅用于视觉呈现。
