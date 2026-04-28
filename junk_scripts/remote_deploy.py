import paramiko
import os

def deploy():
    host = "47.76.179.242"
    port = 22
    users = ["root", "chensan"]
    password = "Cw0057"
    
    for user in users:
        print(f"正在尝试以 {user} 身份连接...")
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(host, port, user, password, timeout=10)
            
            print(f"成功登录 {user}@{host}！开始清理旧代码...")
            
            # 1. 停止旧容器并清理文件
            commands = [
                "docker compose down || docker-compose down",
                "rm -rf *.py *.db ml.log *.png *.json backup_dev/",
                "ls -la"
            ]
            
            for cmd in commands:
                stdin, stdout, stderr = ssh.exec_command(cmd)
                print(f"执行: {cmd}")
                print(stdout.read().decode())
                print(stderr.read().decode())

            # 2. 这里的部署逻辑：我们需要把本地的 index.html 发送过去
            # 先简单创建一个新的 index.html 占位，确认清理成功
            ssh.exec_command("echo '<h1>云帆跨境 PRO 部署中...</h1>' > index.html")
            
            ssh.close()
            print("服务器清理完成！")
            return True
        except Exception as e:
            print(f"用户 {user} 登录失败: {e}")
            
    return False

if __name__ == "__main__":
    deploy()
