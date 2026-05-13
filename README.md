# DeepSeek Token 用量监控

实时监控 DeepSeek API Token 用量的 Web 仪表盘。每 5 分钟自动拉取最新数据，支持日/月视图、柱状图/折线图切换，自动估算费用。

## 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/3609748118/deepseep-token-.git
cd deepseep-token-

# 2. 配置 API Key
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key

# 3. 安装并启动
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。

## 功能

- 今日/本月用量 + 预估费用汇总卡片
- 日用量柱状/折线图（支持 7/14/30 天范围）
- 月用量柱状/折线图（支持 3/6/12 月范围）
- 用量明细表，支持排序（按日期/用量/费用）
- 每 5 分钟自动刷新，支持手动刷新

## 项目结构

```
├── client/          # React 前端 (Vite + TypeScript)
│   └── src/
│       ├── components/
│       │   ├── Header/          # 标题栏 + 刷新按钮
│       │   ├── SummaryCards/    # 今日/本月/费用卡片
│       │   ├── ViewSwitcher/    # 视图切换 + 范围选择
│       │   ├── UsageChart/      # 柱状图/折线图
│       │   └── UsageTable/      # 明细列表
│       ├── api/                 # API 请求封装
│       └── hooks/               # 自定义 hooks
├── server/          # Express 后端
│   └── src/
│       ├── routes/              # API 路由
│       ├── db.ts                # SQLite 数据库
│       └── deepseek.ts          # DeepSeek API 调用
└── docs/            # 设计文档
```

## 技术栈

- **前端**: React 19 + TypeScript + Vite + Recharts + CSS Modules
- **后端**: Express + better-sqlite3 + node-cron
- **数据库**: SQLite（本地文件，零配置）

## 环境要求

- Node.js 18+
- npm 9+
- DeepSeek API Key（在 [DeepSeek 平台](https://platform.deepseek.com/api_keys) 获取）
