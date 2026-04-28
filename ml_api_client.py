import requests
import json
import time

class MercadoLibreClient:
    def __init__(self, client_id, client_secret, redirect_uri):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri

    def exchange_code(self, code, code_verifier=None):
        """Exchange the authorization code for access and refresh tokens."""
        url = "https://api.mercadolibre.com/oauth/token"
        headers = {'accept': 'application/json', 'content-type': 'application/x-www-form-urlencoded'}
        data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": self.redirect_uri
        }
        if code_verifier:
            data["code_verifier"] = code_verifier
        
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error exchanging code: {response.text}")
            return None

    def refresh_token(self, refresh_token):
        """Refresh an expired access token."""
        url = "https://api.mercadolibre.com/oauth/token"
        headers = {'accept': 'application/json', 'content-type': 'application/x-www-form-urlencoded'}
        data = {
            "grant_type": "refresh_token",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token
        }
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Refresh failed: {response.status_code} - {response.text}")
            return None

    def get_user_info(self, access_token):
        """Get information about the authenticated user (including seller_id)."""
        url = "https://api.mercadolibre.com/users/me"
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        return None

    def fetch_orders(self, access_token, seller_id, limit=50, offset=0):
        url = "https://api.mercadolibre.com/marketplace/orders/search"
        params = {"seller.id": seller_id, "limit": limit, "offset": offset}
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(url, headers=headers, params=params)
        return response.json()

    def fetch_reputation(self, access_token, seller_id):
        url = f"https://api.mercadolibre.com/users/{seller_id}"
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json().get('seller_reputation', {})
        return None

    def fetch_shipment(self, access_token, shipment_id):
        url = f"https://api.mercadolibre.com/shipments/{shipment_id}"
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(url, headers=headers)
        return response.json()

    def fetch_claims(self, access_token, seller_id):
        url = f"https://api.mercadolibre.com/v1/claims/search"
        params = {"seller_id": seller_id}
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(url, headers=headers, params=params)
        return response.json()

    def fetch_payouts(self, access_token, seller_id, status='pending'):
        url = f"https://api.mercadolibre.com/payouts/search"
        params = {"seller_id": seller_id, "status": status}
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(url, headers=headers, params=params)
        return response.json()

    def fetch_trends(self, access_token, site_id='MLM', category_id=None):
        """Fetch trends for a specific site and optionally a category."""
        if category_id:
            url = f"https://api.mercadolibre.com/trends/{site_id}/{category_id}"
        else:
            url = f"https://api.mercadolibre.com/trends/{site_id}"
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        return None

    def update_item(self, access_token, item_id, data):
        """Update an item's attributes (title, pictures, etc.)."""
        url = f"https://api.mercadolibre.com/items/{item_id}"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        response = requests.put(url, headers=headers, json=data)
        return response.status_code, response.json()

    def update_description(self, access_token, item_id, text):
        """Update an item's description."""
        url = f"https://api.mercadolibre.com/items/{item_id}/description"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        data = {"plain_text": text}
        response = requests.put(url, headers=headers, json=data)
        return response.status_code, response.json()
