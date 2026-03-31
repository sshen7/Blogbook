# Zine Notes

一款受 Zine 启发的轻量级、高审美、极简主义在线笔记应用。专为私密记录而设计，无社交功能，专注写作体验。

![Zine Notes](public/preview.png)

## ✨ 核心特性

### 🎨 极简设计
- 低饱和度配色，护眼舒适
- 6 种精心设计的编辑器主题
- 响应式布局，支持移动端
- 流畅的动画过渡效果

### 📝 强大的编辑器
- **富文本编辑**：支持 H1-H3 标题、粗体、斜体、引用、列表等
- **Markdown 快捷键**：支持 Markdown 语法快速格式化
- **图片支持**：拖拽上传、粘贴插入、支持本地和云存储
- **6 种主题**：默认、暖纸、夜间、护眼、深色、高对比

### 📚 笔记本管理
- 单层级笔记本，简洁高效
- 拖拽排序，自由组织
- 3D 翻页视图，沉浸式阅读
- 笔记数量实时统计

### 🏷️ 标签系统
- 灵活的标签管理
- 按标签筛选笔记
- 标签云展示

### 🔒 安全与隐私
- **AES-256 加密**：笔记内容端到端加密
- **自动锁定**：可设置闲置时间自动锁定
- **本地优先**：数据存储在自己的服务器上

### 📤 导入导出
- 导出为 Markdown
- 导出为 TXT
- 批量导出笔记本

### 🔍 全文搜索
- 实时搜索笔记标题和内容
- 搜索结果高亮

### 🗑️ 回收站
- 删除的笔记进入回收站
- 支持恢复或永久删除
- 自动清理过期笔记

## 🚀 快速开始

### 方式一：Docker 一键部署（推荐）

#### 前置要求
- Docker 20.10+
- Docker Compose 2.0+

#### 部署步骤

1. **克隆仓库**
```bash
git clone https://github.com/yourusername/zine-notes.git
cd zine-notes
```

2. **配置环境变量**
```bash
# 复制环境配置模板
cp .env.docker .env

# 编辑 .env 文件，修改以下关键配置
# - MYSQL_ROOT_PASSWORD: MySQL root 密码
# - MYSQL_PASSWORD: MySQL 用户密码
# - NEXTAUTH_SECRET: NextAuth 密钥（生成：openssl rand -base64 32）
# - ENCRYPTION_KEY: 加密密钥（必须是 32 个字符）
```

3. **启动服务**

**Linux/macOS:**
```bash
chmod +x scripts/docker-deploy.sh
./scripts/docker-deploy.sh deploy
```

**Windows:**
```powershell
.\scripts\docker-deploy.ps1 deploy
```

4. **访问应用**
打开浏览器访问 http://localhost:3000

#### 常用命令

```bash
# 查看帮助
./scripts/docker-deploy.sh help

# 启动服务
./scripts/docker-deploy.sh start

# 停止服务
./scripts/docker-deploy.sh stop

# 查看日志
./scripts/docker-deploy.sh logs

# 备份数据库
./scripts/docker-deploy.sh backup

# 恢复数据库
./scripts/docker-deploy.sh restore backups/zine_backup_20240101_120000.sql

# 更新部署
./scripts/docker-deploy.sh update
```

### 方式二：手动部署

#### 前置要求
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

#### 部署步骤

1. **安装依赖**
```bash
npm install
```

2. **配置数据库**

创建 MySQL 数据库：
```bash
mysql -u root -p < scripts/init-mysql.sql
```

3. **配置环境变量**
```bash
cp .env.local.example .env.local
# 编辑 .env.local，配置数据库连接和其他参数
```

4. **初始化数据库**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **构建并启动**
```bash
npm run build
npm start
```

## 📁 项目结构

```
zine-notes/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── note/              # 笔记页面
│   ├── notebook/          # 笔记本页面
│   ├── tags/              # 标签页面
│   ├── trash/             # 回收站
│   ├── search/            # 搜索页面
│   └── settings/          # 设置页面
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   ├── editor/           # 编辑器组件
│   └── notebook/         # 笔记本相关组件
├── lib/                   # 工具库
│   ├── auth.ts           # 认证配置
│   ├── prisma.ts         # Prisma 客户端
│   ├── crypto.ts         # 加密工具
│   └── themes.ts         # 编辑器主题
├── hooks/                 # 自定义 Hooks
├── prisma/               # Prisma 配置
│   └── schema.prisma     # 数据库模型
├── scripts/              # 脚本文件
│   ├── init-mysql.sql    # MySQL 初始化
│   ├── docker-deploy.sh  # Docker 部署脚本
│   └── docker-deploy.ps1 # Windows 部署脚本
├── public/               # 静态资源
├── Dockerfile            # Docker 镜像配置
├── docker-compose.yml    # Docker Compose 配置
└── package.json          # 项目依赖
```

## ⚙️ 环境变量配置

### 必需配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | MySQL 连接字符串 | `mysql://user:pass@localhost:3306/zine_notes` |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | AES 加密密钥（32 字符） | `your-32-char-encryption-key-here!!` |

### 可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NEXTAUTH_URL` | 应用 URL | `http://localhost:3000` |
| `STORAGE_PROVIDER` | 存储提供商 | `local` |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | - |

### 云存储配置（可选）

#### 阿里云 OSS
```env
STORAGE_PROVIDER=oss
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your-access-key
OSS_ACCESS_KEY_SECRET=your-secret-key
OSS_BUCKET=your-bucket
```

#### AWS S3
```env
STORAGE_PROVIDER=s3
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket
```

## 🛠️ 技术栈

- **框架**: [Next.js 14](https://nextjs.org/) (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **数据库**: [MySQL](https://www.mysql.com/) + [Prisma](https://www.prisma.io/)
- **编辑器**: [TipTap](https://tiptap.dev/)
- **认证**: [NextAuth.js](https://next-auth.js.org/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **拖拽**: [@dnd-kit](https://dndkit.com/)

## 🔐 安全说明

1. **加密密钥**: `ENCRYPTION_KEY` 必须是 32 个字符，用于 AES-256 加密
2. **NextAuth 密钥**: 使用 `openssl rand -base64 32` 生成随机密钥
3. **生产环境**: 务必修改所有默认密码和密钥
4. **HTTPS**: 生产环境建议使用 HTTPS

## 📖 使用指南

### 创建笔记
1. 选择或创建一个笔记本
2. 点击"新建笔记"按钮
3. 在编辑器中输入内容
4. 自动保存

### 使用标签
1. 在笔记编辑器中点击标签图标
2. 输入标签名称，按回车添加
3. 在侧边栏点击标签筛选笔记

### 3D 翻页视图
1. 打开任意笔记本
2. 点击翻页视图按钮
3. 使用键盘左右键或点击翻页

### 自动锁定
1. 进入设置页面
2. 开启自动锁定
3. 设置闲置时间
4. 需要密码解锁

### 导入导出
1. 在笔记列表右键点击笔记
2. 选择"导出为 Markdown"或"导出为 TXT"
3. 批量导出：在笔记本菜单中选择"导出全部"

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT](LICENSE)

## 🙏 致谢

- [Zine](https://zine.la/) - 设计灵感来源
- [shadcn/ui](https://ui.shadcn.com/) - 精美的 UI 组件
- [TipTap](https://tiptap.dev/) - 强大的编辑器框架
