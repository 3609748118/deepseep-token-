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

---

## 前置准备（必须先装）

| 工具 | 下载 | 说明 |
|------|------|------|
| **Node.js** ≥ 18 | [nodejs.org](https://nodejs.org) | 点左边 LTS 按钮下载，安装一路下一步。装完就有 `npm` |
| **Git**（推荐） | [git-scm.com](https://git-scm.com/download/win) | 选 Windows 版，一路下一步。没有也能用，看下方 B 方案 |

---

## 快速开始

### A 方案：有 Git（推荐）

```bash
git clone https://github.com/3609748118/deepseep-token-.git
cd deepseep-token-
```

### B 方案：没有 Git

打开 [github.com/3609748118/deepseep-token-](https://github.com/3609748118/deepseep-token-)，点绿色的 **Code** 按钮 → **Download ZIP**，解压到任意文件夹，然后在该文件夹里打开终端。

### 都一样的后续步骤：

**1. 配置 API Key**

Windows 用户：
```bash
copy .env.example .env
notepad .env
```

Mac / Linux 用户：
```bash
cp .env.example .env
nano .env
```

把文件里的 `your_deepseek_api_key_here` 替换成你的 DeepSeek API Key（去 [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) 复制），保存关闭。

---

**2. 安装依赖**

```bash
npm install
```
等 1-2 分钟，装完后会自动继续装前端和后端的依赖。

> 如果报错，可能是缺少 C++ 编译环境。去 [nodejs.org](https://nodejs.org) 重新安装 Node.js，安装时**勾选**「Automatically install the necessary tools」即可。

---

**3. 启动**

```bash
npm run dev
```

看到 `Local: http://localhost:5173` 就成功了，浏览器打开这个地址。

---

**4. 首次使用**

点右上角「手动刷新」拉取数据。之后每 5 分钟自动刷新，不用管。

---

## 功能

| 模块 | 说明 |
|------|------|
| 汇总卡片 | 今日用量 / 本月用量 / 预估费用 |
| 用量图表 | 柱状图 / 折线图切换，输入输出堆叠展示 |
| 日视图 | 7 / 14 / 30 天范围可选 |
| 月视图 | 3 / 6 / 12 月范围可选 |
| 明细列表 | 按日期 / 用量 / 请求次数 / 费用排序 |
| 自动刷新 | 每 5 分钟自动拉取，支持手动刷新 |
| 费用估算 | 按 DeepSeek 官方定价自动计算 |

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 · TypeScript · Vite · Recharts · CSS Modules |
| 后端 | Express 5 · better-sqlite3 · node-cron |
| 数据库 | SQLite（本地文件，零配置） |

---

## 常见问题

**Q: 打开网页没有数据？**

首次需要拉取数据，点右上角「手动刷新」。还不行就检查 `.env` 里的 API Key 是否填对了。

**Q: npm install 报错？**

`better-sqlite3` 需要 C++ 编译环境。Windows 上如果报错，去 [nodejs.org](https://nodejs.org) 重新安装 Node.js，安装时勾选「Automatically install the necessary tools」即可。

**Q: 端口被占用？**

默认前端 5173，后端 3001。如果冲突，在 `.env` 里改 `PORT=3002`，前端 vite 也会自动换端口。

**Q: 数据存在哪里？**

`server/data/usage.db`，本地 SQLite 文件，不上传任何服务器。

**Q: 多人共用？**

每人装一份，各自配自己的 API Key，互不影响。

---

## License

MIT
