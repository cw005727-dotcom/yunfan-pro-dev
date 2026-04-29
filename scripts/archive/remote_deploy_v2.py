import paramiko
import os

def deploy():
    host = "47.76.179.242"
    port = 22
    users = ["root", "chensan"]
    password = "Cw005727"
    
    for user in users:
        print(f"正在尝试以 {user} 身份连接...")
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(host, port, user, password, timeout=10)
            
            print(f"成功登录 {user}@{host}！开始深度清理旧代码...")
            
            # 1. 彻底清理旧代码
            commands = [
                "docker compose down || docker-compose down",
                "rm -rf /root/project/*.py /root/project/*.db /root/project/backup_dev",
                "rm -rf /home/chensan/project/*.py /home/chensan/project/*.db /home/chensan/project/backup_dev",
                "mkdir -p ~/yunfan_pro"
            ]
            
            for cmd in commands:
                ssh.exec_command(cmd)
                print(f"执行清理: {cmd}")

            # 2. 上传 index.html
            sftp = ssh.open_sftp()
            local_path = "index.html"
            remote_path = f"{'/' if user == 'root' else '/home/chensan/'}yunfan_pro/index.html"
            sftp.put(local_path, remote_path)
            sftp.close()
            
            # 3. 启动一个极简的 Nginx 服务确保线上预览
            ssh.exec_command(f"cd ~/yunfan_pro && echo 'services:\n  web:\n    image: nginx:alpine\n    ports:\n      - \"8501:80\"\n    volumes:\n      - ./index.html:/usr/share/nginx/html/index.html:ro' > docker-compose.yml && docker compose up -d")
            
            ssh.close()
            print(f"服务器 {user} 部署完成！")
            return True
        except Exception as e:
            print(f"用户 {user} 尝试失败: {e}")
            
    return False

if __name__ == "__main__":
    deploy()
