@echo off
chcp 65001 >nul
echo ========================
echo 🚀 Zine 笔记项目一键启动
echo ========================
echo.

:: 1. 进入项目目录
echo 🔹 进入项目目录...
cd /d "d:\develop\vibecoding\Project01_zine\zine"
if errorlevel 1 (
    echo ❌ 项目目录不存在，请检查路径！
    pause
    exit /b 1
)

:: 2. 安装依赖
echo 🔹 安装项目依赖（首次运行较慢）...
npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败，请检查网络或 npm 配置！
    pause
    exit /b 1
)

:: 3. 复制环境变量文件（如果不存在）
echo 🔹 配置环境变量...
if not exist ".env.local" (
    copy ".env.example" ".env.local"
    echo ⚠️ 已生成 .env.local 文件，请手动填写数据库配置后重新运行！
    pause
    exit /b 0
)

:: 4. 初始化数据库
echo 🔹 初始化数据库...
npx prisma generate
npx prisma migrate dev
if errorlevel 1 (
    echo ❌ 数据库初始化失败，请检查 .env.local 中的数据库配置！
    pause
    exit /b 1
)

:: 5. 启动开发服务器
echo 🔹 启动开发服务器...
echo 🎉 启动成功后，浏览器访问：http://localhost:5173
echo.
npm run dev

pause