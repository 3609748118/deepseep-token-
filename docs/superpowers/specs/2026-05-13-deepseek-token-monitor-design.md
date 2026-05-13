# DeepSeek Token 用量监控 — 设计文档

**日期**: 2026-05-13
**状态**: 设计中 → 待审批

---

## 1. 概述

一个 Web 应用，用于实时监控 DeepSeek API 的 Token 用量。每 5 分钟自动拉取最新数据，提供日用量和月用量两种统计视图，帮助用户掌握 API 消耗和费用预估。

---

## 2. 架构

```
React 前端 (Vite + TypeScript)
    ↕ HTTP REST (localhost:3001)
Node.js Express 后端
    ├── node-cron 定时任务 (每5分钟)
    ├── DeepSeek API 调用 (/v1/usage)
    └── better-sqlite3
        ↕
    SQLite 数据库 (token_usage 表)
```

- **前端**: React 18 + TypeScript + Vite + Recharts + CSS Modules
- **后端**: Node.js + Express + better-sqlite3 + node-cron
- **数据源**: `GET https://api.deepseek.com/v1/usage?start_date=X&end_date=Y`

---

## 3. 页面布局与交互

```
┌──────────────────────────────────────────────┐
│  [DeepSeek图标] DeepSeek Token 监控           │
│                        [手动刷新] [下次刷新]    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ 今日用量  │ │ 本月用量  │ │ 预估费用     │  │
│  │ 1.2M tk  │ │ 8.5M tk  │ │ ¥34.50       │  │
│  └──────────┘ └──────────┘ └──────────────┘  │
│                                               │
│  ┌─ 视图切换 ──────────────────────────────┐  │
│  │  ● 日用量视图    ○ 月用量视图             │  │
│  │  日: [7天 ▼]  月: [6个月 ▼]              │  │
│  └──────────────────────────────────────────┘  │
│                                               │
│  ┌─ 图表 (Recharts) ─────────────────────┐    │
│  │  [柱状图 / 折线图 切换]                  │    │
│  │  ██████████░░░░░░░                     │    │
│  └────────────────────────────────────────┘    │
│                                               │
│  ┌─ 明细列表 ─────────────────────────────┐    │
│  │  日期 | Token用量 | 请求次数 | 费用      │    │
│  │  05-12 | 156,000  | 23次   | ¥0.62     │    │
│  │  05-11 |  89,000  | 12次   | ¥0.35     │    │
│  └────────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

- 顶部：DeepSeek Logo + 标题 + 刷新按钮
- 中部：三个汇总卡片（今日/本月/费用）
- Tab 切换日/月视图，联动图表和明细列表
- 日视图支持 7/14/30 天范围选择
- 月视图支持 3/6/12 月范围选择

---

## 4. 数据库设计

单表 `token_usage`：

```sql
CREATE TABLE token_usage (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id         TEXT UNIQUE NOT NULL,
  model              TEXT NOT NULL,
  prompt_tokens      INTEGER NOT NULL,
  completion_tokens  INTEGER NOT NULL,
  total_tokens       INTEGER NOT NULL,
  recorded_at        TEXT NOT NULL
);

CREATE INDEX idx_recorded_at ON token_usage(recorded_at);
CREATE INDEX idx_model ON token_usage(model);
```

- `request_id` UNIQUE 约束确保 5 分钟拉取不会重复写入
- `recorded_at` 索引支撑按天/月聚合查询

---

## 5. 后端 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/summary` | 今日/本月汇总（卡片数据） |
| GET | `/api/usage/daily?days=30` | 每日聚合（日视图） |
| GET | `/api/usage/monthly?months=12` | 每月聚合（月视图） |
| POST | `/api/refresh` | 手动触发拉取 |

**定时任务**：
- 服务启动立即拉取一次，之后每 5 分钟通过 `node-cron` 拉取当天数据
- 写入使用 `INSERT OR IGNORE` 依赖 request_id 去重

---

## 6. 前端组件树

```
App
├── Header (Logo + 标题 + 刷新按钮 + 倒计时)
├── SummaryCards (今日用量 / 本月用量 / 预估费用)
├── ViewSwitcher (日 Tab / 月 Tab + 日期范围选择)
├── UsageChart (Recharts BarChart / LineChart 切换)
└── UsageTable (明细列表，支持排序)
```

---

## 7. 费用估算

按照 DeepSeek 官方定价（以 deepseek-v3 为例）：
- 输入: ¥1.00 / 百万 token
- 输出: ¥4.00 / 百万 token

费用计算在后端聚合时完成，前端仅展示。
定价配置放在后端 config 中，后续可调整。

---

## 8. 后续可扩展（不在本次范围）

- 告警阈值设置（Token 超量提醒）
- 按模型拆分统计
- 多 API Key 支持
- 导出 Excel 报表
