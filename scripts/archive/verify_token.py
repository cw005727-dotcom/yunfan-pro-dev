from ml_api_client import MercadoLibreClient

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"
CODE = "TG-69eacf3ec12b2f0001f8f4c1-2588663725"
VERIFIER = "SnafBGVt0lym6ixLNcJslf89LlKwdns0CJe5eF6FOQM"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
success = client.exchange_code(CODE, code_verifier=VERIFIER)

if success:
    print("TOKEN_EXCHANGE_SUCCESS")
else:
    print("TOKEN_EXCHANGE_FAILED")
