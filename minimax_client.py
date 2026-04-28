import requests
import json
import os

class MiniMaxClient:
    def __init__(self, config_path='config.json'):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        self.api_key = self.config.get('minimax_api_key')
        self.base_url = self.config.get('minimax_base_url', 'https://api.minimax.chat/v1')
        self.model = self.config.get('minimax_model', 'abab6.5s-chat')

    def chat(self, prompt, system_prompt="你是一位专业的美客多（Mercado Libre）运营专家。"):
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            return f"AI 响应失败: {str(e)}"

# 测试代码
if __name__ == "__main__":
    client = MiniMaxClient()
    print(client.chat("你好，请简要介绍一下美客多墨西哥站点的潜力。"))
