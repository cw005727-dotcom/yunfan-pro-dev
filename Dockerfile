# 使用轻量级 Python 镜像
FROM python:3.12-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# 复制项目文件
COPY . .

# 安装 Python 依赖
RUN pip3 install -r requirements.txt

# 暴露 Streamlit 默认端口
EXPOSE 8501

# 检查健康状态
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health

# 赋予启动脚本权限
RUN chmod +x start.sh

# 启动命令
CMD ["./start.sh"]
