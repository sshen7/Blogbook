#!/bin/bash

# Zine Notes - Docker 部署脚本
# 用于在 Linux/macOS 上快速部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_success "Docker 和 Docker Compose 已安装"
}

# 检查环境文件
check_env() {
    if [ ! -f ".env" ]; then
        if [ -f ".env.docker" ]; then
            print_warning ".env 文件不存在，从 .env.docker 复制..."
            cp .env.docker .env
            print_success ".env 文件已创建"
            print_warning "请编辑 .env 文件，修改默认密码和密钥！"
        else
            print_error ".env.docker 模板文件不存在"
            exit 1
        fi
    else
        print_success ".env 文件已存在"
    fi
}

# 首次部署
first_deploy() {
    print_info "开始首次部署..."
    
    # 构建并启动服务
    print_info "构建 Docker 镜像并启动服务..."
    docker-compose up --build -d
    
    # 等待 MySQL 启动
    print_info "等待 MySQL 启动..."
    sleep 10
    
    # 执行数据库迁移
    print_info "执行数据库迁移..."
    docker-compose exec -T app npx prisma migrate deploy
    
    # 生成 Prisma Client
    print_info "生成 Prisma Client..."
    docker-compose exec -T app npx prisma generate
    
    print_success "首次部署完成！"
    print_info "应用访问地址: http://localhost:3000"
}

# 更新部署
update_deploy() {
    print_info "开始更新部署..."
    
    # 拉取最新代码（如果是 git 仓库）
    if [ -d ".git" ]; then
        print_info "拉取最新代码..."
        git pull
    fi
    
    # 重建并重启服务
    print_info "重建 Docker 镜像..."
    docker-compose up --build -d
    
    # 执行数据库迁移
    print_info "执行数据库迁移..."
    docker-compose exec -T app npx prisma migrate deploy
    
    print_success "更新部署完成！"
}

# 查看日志
show_logs() {
    print_info "查看日志..."
    docker-compose logs -f
}

# 查看应用日志
show_app_logs() {
    print_info "查看应用日志..."
    docker-compose logs -f app
}

# 查看数据库日志
show_db_logs() {
    print_info "查看数据库日志..."
    docker-compose logs -f mysql
}

# 停止服务
stop_services() {
    print_info "停止服务..."
    docker-compose down
    print_success "服务已停止"
}

# 停止并删除数据
stop_and_clean() {
    print_warning "这将停止服务并删除所有数据！"
    read -p "确定要继续吗？(yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        print_info "停止服务并删除数据..."
        docker-compose down -v
        print_success "服务和数据已删除"
    else
        print_info "操作已取消"
    fi
}

# 数据库备份
backup_db() {
    local backup_dir="backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/zine_backup_$timestamp.sql"
    
    mkdir -p "$backup_dir"
    
    print_info "备份数据库..."
    docker-compose exec -T mysql mysqldump -u root -p"${MYSQL_ROOT_PASSWORD:-zine_root_password}" zine_notes > "$backup_file"
    
    print_success "数据库已备份到: $backup_file"
}

# 数据库恢复
restore_db() {
    if [ -z "$1" ]; then
        print_error "请指定备份文件路径"
        print_info "用法: $0 restore <备份文件路径>"
        exit 1
    fi
    
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        print_error "备份文件不存在: $backup_file"
        exit 1
    fi
    
    print_warning "这将覆盖现有数据库数据！"
    read -p "确定要继续吗？(yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        print_info "恢复数据库..."
        docker-compose exec -T mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD:-zine_root_password}" zine_notes < "$backup_file"
        print_success "数据库已恢复"
    else
        print_info "操作已取消"
    fi
}

# 显示状态
show_status() {
    print_info "服务状态:"
    docker-compose ps
    
    print_info "\n容器资源使用:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# 进入容器 shell
enter_app() {
    print_info "进入应用容器..."
    docker-compose exec app sh
}

enter_db() {
    print_info "进入数据库容器..."
    docker-compose exec mysql bash
}

# 显示帮助
show_help() {
    echo "Zine Notes Docker 部署脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  deploy       首次部署应用"
    echo "  update       更新部署（保留数据）"
    echo "  start        启动服务"
    echo "  stop         停止服务"
    echo "  restart      重启服务"
    echo "  logs         查看所有日志"
    echo "  logs:app     查看应用日志"
    echo "  logs:db      查看数据库日志"
    echo "  status       显示服务状态"
    echo "  backup       备份数据库"
    echo "  restore      恢复数据库"
    echo "  clean        停止并删除所有数据（危险！）"
    echo "  shell:app    进入应用容器 shell"
    echo "  shell:db     进入数据库容器 shell"
    echo "  help         显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 deploy              # 首次部署"
    echo "  $0 update              # 更新部署"
    echo "  $0 backup              # 备份数据库"
    echo "  $0 restore backups/zine_backup_20240101_120000.sql"
}

# 主函数
main() {
    case "${1:-help}" in
        deploy)
            check_docker
            check_env
            first_deploy
            ;;
        update)
            check_docker
            update_deploy
            ;;
        start)
            check_docker
            docker-compose up -d
            print_success "服务已启动"
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            sleep 2
            docker-compose up -d
            print_success "服务已重启"
            ;;
        logs)
            show_logs
            ;;
        logs:app)
            show_app_logs
            ;;
        logs:db)
            show_db_logs
            ;;
        status)
            show_status
            ;;
        backup)
            backup_db
            ;;
        restore)
            restore_db "$2"
            ;;
        clean)
            stop_and_clean
            ;;
        shell:app)
            enter_app
            ;;
        shell:db)
            enter_db
            ;;
        help|*)
            show_help
            ;;
    esac
}

main "$@"
