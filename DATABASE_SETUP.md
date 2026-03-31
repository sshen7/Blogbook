# MySQL 数据库设置指南

## 1. 安装 MySQL

### Windows
1. 下载 MySQL Installer: https://dev.mysql.com/downloads/installer/
2. 运行安装程序，选择 "Server only" 或 "Full" 安装
3. 设置 root 密码（记住这个密码）
4. 确保 MySQL 服务正在运行

### macOS
```bash
brew install mysql
brew services start mysql
```

### Linux (Ubuntu)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

## 2. 创建数据库

### 方法1: 使用命令行
```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE zine_notes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建专用用户（推荐）
CREATE USER 'zine_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON zine_notes.* TO 'zine_user'@'localhost';
FLUSH PRIVILEGES;

# 退出
EXIT;
```

### 方法2: 使用脚本
```bash
mysql -u root -p < scripts/init-mysql.sql
```

## 3. 配置环境变量

编辑 `.env.local` 文件：

```env
# 使用 root 用户
DATABASE_URL="mysql://root:你的密码@localhost:3306/zine_notes"

# 或使用专用用户（推荐）
DATABASE_URL="mysql://zine_user:your_password@localhost:3306/zine_notes"
```

## 4. 初始化数据库

确保你已经安装了 Node.js 依赖：

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# （可选）查看数据库
npx prisma studio
```

## 5. 验证安装

```bash
# 检查数据库连接
npx prisma db pull

# 如果成功，会显示数据库结构
```

## 常见问题

### 1. 连接失败
- 检查 MySQL 服务是否运行
- 检查用户名和密码是否正确
- 检查端口是否正确（默认3306）

### 2. 权限错误
```bash
# 给 root 用户所有权限
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### 3. 字符集问题
确保数据库使用 `utf8mb4` 字符集以支持中文和emoji。

## 技术栈

- **数据库**: MySQL 8.0+
- **ORM**: Prisma
- **字符集**: utf8mb4
