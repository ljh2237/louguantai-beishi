# 楼观台碑刻数字平台

楼观台碑刻数字化检索与智能导览平台 —— 比赛初赛原型。

## 在线访问

GitHub Pages：https://ljh2237.github.io/louguantai-beishi/

## 本地运行

### 环境要求

- Node.js ≥ 18（推荐 20+）
- npm

### 安装与启动

Windows 下可直接双击：

1. `安装依赖.bat` —— 首次运行，安装 npm 依赖
2. `启动项目.bat` —— 启动开发服务器

或手动执行：

```bash
npm install
npm run dev
```

打开 http://localhost:3000 即可访问。

### 构建静态站点

```bash
# 本地开发（无 basePath）
npm run build

# 模拟 GitHub Pages（含子路径）
NEXT_PUBLIC_BASE_PATH=/louguantai-beishi npm run build
```

构建产物输出到 `out/`。

## 项目简介

本项目对楼观台碑刻资料进行数字化整理，提供：

- 碑刻全文检索（跨碑名、碑文、人物、地点、简介）
- 搜索结果关键词高亮与上下文展示
- 朝代筛选
- 碑刻详情页（碑阳 / 碑阴 / 碑文原文）
- 碑石图片浏览与放大查看
- 留言互动（本地持久化）
- 智能碑刻助手（本地知识库问答）

## 目录结构

```
louguantai-beishi-web/
├── app/                     # Next.js App Router 页面
│   ├── page.tsx             # 首页
│   ├── tablets/[slug]/      # 碑刻详情页（静态预生成）
│   ├── gallery/             # 碑石图库
│   └── layout.tsx
├── components/              # UI 组件
├── lib/                     # 业务逻辑（搜索/助手/留言/数据）
├── types/                   # TypeScript 类型
├── data/                    # 结构化数据（由 scripts 生成）
│   ├── tablets.json         # 最终碑刻数据库
│   ├── tablets_raw.json     # Word 提取原始结果
│   ├── pdf_index.json       # PDF 页码索引
│   ├── tablets.csv          # 人工核对表
│   ├── review_queue.json    # 待人工复核队列
│   ├── extraction_report.json
│   └── data_validation_report.json
├── scripts/                 # Python 数据处理脚本
├── public/
│   ├── data/tablets.json    # 供浏览器读取的静态数据
│   └── tablets/pages/       # PDF 渲染出的碑石图片
└── .github/workflows/       # GitHub Actions 自动部署
```

## 数据来源

网页数据库来自两份本地原始资料，经脚本整理为结构化数据：

1. 《楼观台道教碑石》扫描版 PDF —— 用于提取碑石图片（112 页）
2. 文本.docx —— 碑文正文的权威来源（识别 110 块碑刻篇目）

**原始 PDF 与 Word 未随公开仓库发布**，网页使用的是整理后的结构化数据。

## 如何重新生成碑刻数据库

依赖 Python 3 与 `python-docx`、`PyMuPDF`、`pypinyin`：

```bash
pip install python-docx pymupdf pypinyin

python scripts/extract_docx.py    # 从 文本.docx 提取碑刻篇目
python scripts/render_pdf.py      # 渲染 PDF 页面为图片
python scripts/build_tablets.py   # 合并生成 tablets.json / csv
python scripts/validate_data.py   # 数据校验
```

> 脚本默认读取上级目录（项目根目录 `beishi/`）下的 `文本.docx` 与 `楼观台道教碑石.pdf`。

## 如何运行数据校验

```bash
python scripts/validate_data.py
```

结果输出到 `data/data_validation_report.json`。

## 智能助手如何工作

智能碑刻助手采用「本地检索 + 大模型增强（RAG）」架构：

1. 浏览器读取 `public/data/tablets.json`
2. 先本地全文检索碑刻资料，把相关碑刻的标题、简介、碑文摘录作为 context
3. 将 context 发给 Qwen（阿里云百炼 OpenAI 兼容接口，模型 `qwen3.6-flash`）组织回答
4. system prompt 强制模型「只能根据提供的资料回答，不得编造资料中没有的历史信息」
5. 若大模型接口调用失败（网络/跨域/超时），自动回退到纯本地知识库模式，不影响使用

> ⚠️ 安全说明：本阶段为比赛演示，API Key 直接写在前端并会随公开仓库发布（已获授权）。
> 正式上线时，应将 API Key 移到安全的后端代理服务，前端只调用代理。

### 大模型接口配置

接口信息位于 `lib/llm.ts`：

- baseUrl：`https://ws-ib6pqmfegl5pfe3s.cn-beijing.maas.aliyuncs.com/compatible-mode/v1`
- model：`qwen3.6-flash`

如需更换模型或 Key，修改 `lib/llm.ts` 中的 `LLM_CONFIG` 即可。

## 留言数据存在哪里

比赛演示版本的留言数据保存在**浏览器 localStorage** 中，仅本机可见，不同设备之间不共享。页面刷新或关闭浏览器后留言仍保留。正式上线时可替换为 Supabase / 数据库等方案。

## 哪些资料需要人工复核

所有自动识别的结果均可在 `data/review_queue.json` 中查看。主要包括：

- 朝代、年代、撰文人等字段由标题/说明文字自动推断，需人工核对
- 碑刻图片与 PDF 页码的对应关系为按书页顺序的假设，需人工核对
- 佚碑存文 / 佚碑存目类碑刻（原碑已佚）无存图
- 标题含 `*` 前缀的条目可能为刻石类，需核对分类
- `佚名楼观题咏刻石`、`重修说经台记` 各出现两次，为源书中的同名不同碑

## 技术说明

- 静态导出（`output: 'export'`），兼容 GitHub Pages
- 碑刻资料为静态数据库（`public/data/tablets.json`）
- 搜索为浏览器本地全文搜索
- 留言使用 localStorage
- 智能助手使用本地碑刻知识库 + Qwen 大模型增强（RAG）
- 本阶段未实现任何视频功能
