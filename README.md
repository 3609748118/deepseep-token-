<p align="center">
  <img src="client/public/favicon.svg" width="80" alt="DeepSeek Token Monitor" />
</p>

<h1 align="center">DeepSeek Token Monitor</h1>

<p align="center">
  <strong>实时监控 DeepSeek API Token 用量 · 本地一键部署 · 零依赖云服务</strong>
</p>

<p align="center">
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node.js" /></a>
  <a href="#"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

---

## 这是什么？

一个轻量级 Web 仪表盘，自动拉取 DeepSeek API 用量数据到本地 SQLite，提供可视化图表和费用估算。**完全本地运行，数据不出你电脑。**

## 快速开始

```bash
# 克隆项目
git clone https://github.com/3609748118/deepseep-token-.git
cd deepseep-token-

# 配置 API Key
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key

# 启动
npm install && npm run dev
```

浏览器打开 **http://localhost:5173**，开始监控。

## 功能

| 模块 | 说明 |
|------|------|
| 汇总卡片 | 今日用量 / 本月用量 / 预估费用，一目了然 |
| 用量图表 | 柱状图、折线图切换，输入/输出堆叠展示 |
| 日视图 | 支持 7 / 14 / 30 天范围 |
| 月视图 | 支持 3 / 6 / 12 月范围 |
| 明细列表 | 按日期/用量/费用排序，支持升降序 |
| 自动刷新 | 每 5 分钟自动拉取，也支持手动刷新 |
| 费用估算 | 按 DeepSeek 官方定价自动计算 |

## 项目结构

```
├── client/              # React 前端
│   └── src/
│       ├── components/
│       │   ├── Header/           # 标题栏 + 倒计时 + 刷新
│       │   ├── SummaryCards/     # 用量卡片
│       │   ├── ViewSwitcher/     # 视图/范围切换
│       │   ├── UsageChart/       # Recharts 图表
│       │   └── UsageTable/       # 数据明细表
│       ├── api/                  # API 请求
│       └── hooks/                # 自定义 Hook
├── server/              # Express 后端
│   └── src/
│       ├── routes/               # REST API
│       ├── db.ts                 # SQLite 操作
│       └── deepseek.ts           # DeepSeek API 调用
└── docs/                # 设计文档
```

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 · TypeScript · Vite · Recharts · CSS Modules |
| 后端 | Express 5 · better-sqlite3 · node-cron · tsx |
| 数据库 | SQLite（本地文件，零配置） |

## 环境要求

- **Node.js** ≥ 18
- **DeepSeek API Key** — [获取地址](https://platform.deepseek.com/api_keys)

## 常见问题

**Q: 数据存在哪里？**  
A: 本地 SQLite 文件 `server/data/usage.db`，不会上传到任何服务器。

**Q: 为什么刷新后没有数据？**  
A: 首次使用需要等待 DeepSeek API 返回用量数据。检查 `.env` 中 API Key 是否正确，然后点「手动刷新」。

**Q: 可以多人共用吗？**  
A: 每人 clone 一份到自己的电脑，各自配自己的 API Key，互不影响。

## License

MIT © 2026
