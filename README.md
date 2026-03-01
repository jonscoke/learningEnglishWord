# LingoLearn - English Word Learning App

基于 React + Vite 的英语单词学习应用，支持多词库学习、练习测验、学习进度统计，以及可搜索的虚拟滚动单词列表。

## 功能概览

### 1) 学习模块（Learn）
- 远程词库切换：`CET-4`、`CET-6`、`TEM-8`
- 单词卡片翻转：正面英文/音标，背面中文释义/例句
- 左右滑动切词 + 上下文导航按钮（Previous / Next）
- 收藏单词（本地持久化）
- 朗读发音（Web Speech API）
- 长按查看详情抽屉（同义词、例句等）
- 下拉刷新词库（移动端触摸下拉）

### 2) 练习模块（Practice）
- 题型支持：
  - 选择题（中译英）
  - 听音辨词
  - 填空题
  - 拖拽排序题（DnD）
- 单题倒计时（30s）
- 自动计分与练习结果统计
- 练习记录写入本地，用于进度页展示

### 3) 进度模块（Progress）
- 连续学习天数（streak）
- 已学词汇量统计
- 正确率统计与趋势图（最近练习记录）
- 成就徽章（按 streak / vocab 阈值解锁）
- 全量单词列表：
  - 支持搜索（单词/释义/音标）
  - 虚拟滚动 + 分批加载（滑动触底自动追加）
  - 点击词条可跳转到学习页并定位该词

## 技术栈

### 前端框架
- React 18
- Vite 5

### UI 与交互
- Chakra UI
- Framer Motion
- React Icons

### 数据与状态
- React Context（全局学习状态）
- LocalStorage（收藏、已学、练习历史、streak、跨页定位词）
- 远程词库数据：`jsDelivr + zip + ndjson`
- JSZip（解压远程词库包）

### 组件与图表
- `react-window`（虚拟列表）
- `recharts`（趋势图）
- `@dnd-kit/*`（拖拽排序题）

## 项目结构

```text
src/
  api/                 # 远程词库拉取与解析
  components/          # 通用、学习、练习、进度相关组件
  context/             # LearningContext 全局状态
  data/                # 练习题生成逻辑与徽章配置
  hooks/               # 下拉刷新、本地存储 hooks
  pages/               # Learn / Practice / Progress 页面
  utils/               # 语音播报、数组工具等
```

## 本地开发

### 环境要求
- Node.js 18+（建议 LTS）
- npm 9+

### 安装依赖
```bash
npm install
```

### 启动开发环境
```bash
npm run dev
```

默认访问：`http://localhost:5173`

### 生产构建
```bash
npm run build
```

### 本地预览构建产物
```bash
npm run preview
```

## 部署方法

该项目是标准 Vite 静态站点，构建后产物位于 `dist/`，可部署到任意静态托管平台。

### 方案 1：Nginx / 静态服务器部署
1. 执行 `npm run build`
2. 将 `dist/` 目录上传到服务器，例如 `/var/www/lingolearn`
3. Nginx `root` 指向该目录
4. 重启 Nginx

示例配置（SPA）：
```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/lingolearn;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### 方案 2：Vercel 部署
1. 将项目推送到 GitHub/GitLab/Bitbucket
2. 在 Vercel 导入仓库
3. 框架选择 `Vite`（通常自动识别）
4. 构建命令：`npm run build`
5. 输出目录：`dist`
6. 点击 Deploy

### 方案 3：Netlify 部署
1. 在 Netlify 导入仓库
2. Build command：`npm run build`
3. Publish directory：`dist`
4. Deploy

或本地构建后直接拖拽 `dist/` 到 Netlify Drop。

## 配置说明

项目包含 `.env.example`：

```bash
VITE_API_BASE_URL=
```

当前代码默认直接请求公开词库地址，`VITE_API_BASE_URL` 预留给后续 API 扩展，现阶段非必填。

## 说明与限制

- 语音朗读依赖浏览器 `speechSynthesis`，部分浏览器或设备表现可能不同。
- 词库来源于远程 CDN，网络受限时可能出现加载失败提示。
- 首次切换词库会下载并解析 zip 数据，完成后有缓存，后续访问更快。
