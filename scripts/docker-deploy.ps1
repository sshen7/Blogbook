# Zine Notes - Docker 部署脚本 (PowerShell)
# 用于在 Windows 上快速部署

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$BackupFile
)

# 颜色定义
function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Blue
}

function Write-Success($message) {
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# 检查 Docker 是否安装
function Test-Docker {
    try {
        $null = docker --version
        $null = docker-compose --version
        Write-Success "Docker 和 Docker Compose 已安装"
        return $true
    } catch {
        Write-Error "Docker 或 Docker Compose 未安装，请先安装 Docker Desktop"
        return $false
    }
}

# 检查环境文件
function Test-EnvFile {
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.docker") {
            Write-Warning ".env 文件不存在，从 .env.docker 复制..."
            Copy-Item ".env.docker" ".env"
            Write-Success ".env 文件已创建"
            Write-Warning "请编辑 .env 文件，修改默认密码和密钥！"
        } else {
            Write-Error ".env.docker 模板文件不存在"
            exit 1
        }
    } else {
        Write-Success ".env 文件已存在"
    }
}

# 首次部署
function Deploy-First {
    Write-Info "开始首次部署..."
    
    # 构建并启动服务
    Write-Info "构建 Docker 镜像并启动服务..."
    docker-compose up --build -d
    
    # 等待 MySQL 启动
    Write-Info "等待 MySQL 启动..."
    Start-Sleep -Seconds 10
    
    # 执行数据库迁移
    Write-Info "执行数据库迁移..."
    docker-compose exec -T app npx prisma migrate deploy
    
    # 生成 Prisma Client
    Write-Info "生成 Prisma Client..."
    docker-compose exec -T app npx prisma generate
    
    Write-Success "首次部署完成！"
    Write-Info "应用访问地址: http://localhost:3000"
}

# 更新部署
function Deploy-Update {
    Write-Info "开始更新部署..."
    
    # 重建并重启服务
    Write-Info "重建 Docker 镜像..."
    docker-compose up --build -d
    
    # 执行数据库迁移
    Write-Info "执行数据库迁移..."
    docker-compose exec -T app npx prisma migrate deploy
    
    Write-Success "更新部署完成！"
}

# 查看日志
function Show-Logs {
    Write-Info "查看日志..."
    docker-compose logs -f
}

# 查看应用日志
function Show-AppLogs {
    Write-Info "查看应用日志..."
    docker-compose logs -f app
}

# 查看数据库日志
function Show-DbLogs {
    Write-Info "查看数据库日志..."
    docker-compose logs -f mysql
}

# 停止服务
function Stop-Services {
    Write-Info "停止服务..."
    docker-compose down
    Write-Success "服务已停止"
}

# 停止并删除数据
function Stop-AndClean {
    $confirm = Read-Host "这将停止服务并删除所有数据！确定要继续吗？(yes/no)"
    if ($confirm -eq "yes") {
        Write-Info "停止服务并删除数据..."
        docker-compose down -v
        Write-Success "服务和数据已删除"
    } else {
        Write-Info "操作已取消"
    }
}

# 数据库备份
function Backup-Database {
    $backupDir = "backups"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "$backupDir\zine_backup_$timestamp.sql"
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    
    # 从 .env 文件读取密码
    $envContent = Get-Content ".env"
    $rootPassword = ($envContent | Select-String "MYSQL_ROOT_PASSWORD=").ToString().Split("=")[1]
    
    Write-Info "备份数据库..."
    docker-compose exec -T mysql mysqldump -u root -p"$rootPassword" zine_notes > $backupFile
    
    Write-Success "数据库已备份到: $backupFile"
}

# 数据库恢复
function Restore-Database($filePath) {
    if (-not $filePath) {
        Write-Error "请指定备份文件路径"
        Write-Info "用法: .\scripts\docker-deploy.ps1 restore <备份文件路径>"
        exit 1
    }
    
    if (-not (Test-Path $filePath)) {
        Write-Error "备份文件不存在: $filePath"
        exit 1
    }
    
    $confirm = Read-Host "这将覆盖现有数据库数据！确定要继续吗？(yes/no)"
    if ($confirm -eq "yes") {
        # 从 .env 文件读取密码
        $envContent = Get-Content ".env"
        $rootPassword = ($envContent | Select-String "MYSQL_ROOT_PASSWORD=").ToString().Split("=")[1]
        
        Write-Info "恢复数据库..."
        Get-Content $filePath | docker-compose exec -T mysql mysql -u root -p"$rootPassword" zine_notes
        Write-Success "数据库已恢复"
    } else {
        Write-Info "操作已取消"
    }
}

# 显示状态
function Show-Status {
    Write-Info "服务状态:"
    docker-compose ps
    
    Write-Info "`n容器资源使用:"
    docker stats --no-stream --format "table {{.Name}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.NetIO}}`t{{.BlockIO}}"
}

# 显示帮助
function Show-Help {
    Write-Host @"
Zine Notes Docker 部署脚本

用法: .\scripts\docker-deploy.ps1 [命令]

命令:
  deploy       首次部署应用
  update       更新部署（保留数据）
  start        启动服务
  stop         停止服务
  restart      重启服务
  logs         查看所有日志
  logs:app     查看应用日志
  logs:db      查看数据库日志
  status       显示服务状态
  backup       备份数据库
  restore      恢复数据库
  clean        停止并删除所有数据（危险！）
  help         显示此帮助信息

示例:
  .\scripts\docker-deploy.ps1 deploy              # 首次部署
  .\scripts\docker-deploy.ps1 update              # 更新部署
  .\scripts\docker-deploy.ps1 backup              # 备份数据库
  .\scripts\docker-deploy.ps1 restore backups\zine_backup_20240101_120000.sql
"@
}

# 主逻辑
switch ($Command.ToLower()) {
    "deploy" {
        if (Test-Docker) {
            Test-EnvFile
            Deploy-First
        }
    }
    "update" {
        if (Test-Docker) {
            Deploy-Update
        }
    }
    "start" {
        if (Test-Docker) {
            docker-compose up -d
            Write-Success "服务已启动"
        }
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Stop-Services
        Start-Sleep -Seconds 2
        docker-compose up -d
        Write-Success "服务已重启"
    }
    "logs" {
        Show-Logs
    }
    "logs:app" {
        Show-AppLogs
    }
    "logs:db" {
        Show-DbLogs
    }
    "status" {
        Show-Status
    }
    "backup" {
        Backup-Database
    }
    "restore" {
        Restore-Database $BackupFile
    }
    "clean" {
        Stop-AndClean
    }
    default {
        Show-Help
    }
}
