import requests
import sqlite3
import time
import os
from database import get_db
from token_manager import load_tokens

def pull_reputation():
    # Fetch access token from token_manager
    tokens = load_tokens()
    if not tokens or 'access_token' not in tokens:
        print("Error: Could not load access token.")
        return

    headers = {
        'Authorization': f"Bearer {tokens['access_token']}"
    }

    print("Fetching global reputation matrix...")
    # For CBT accounts, we must use the global reputation endpoint to get site-specific metrics
    global_url = "https://api.mercadolibre.com/global/users/seller_reputation"
    
    try:
        response = requests.get(global_url, headers=headers)
        if response.status_code != 200:
            print(f"Error fetching global reputation: {response.status_code} - {response.text}")
            return
        
        data = response.json()
        reputation_list = data.get('seller_reputation', [])
        
        if not reputation_list:
            print("No reputation data found in API response.")
            return

        # Sort reputation_list to prioritize 'remote' over 'fulfillment'
        # This ensures that if both exist, 'remote' (CBT) metrics are applied last
        reputation_list.sort(key=lambda x: 1 if x.get('logistic_type') == 'remote' else 0)

        conn = get_db()
        cursor = conn.cursor()

        for rep in reputation_list:
            site_id = rep.get('site_id')
            logistic_type = rep.get('logistic_type')
            
            # Use the inner seller_reputation object
            rep_detail = rep.get('seller_reputation', {})
            reputation_level = rep_detail.get('level_id')
            metrics = rep_detail.get('metrics', {})
            
            # For percentage display, we convert decimal to string percentage
            complaints_rate = f"{metrics.get('claims', {}).get('rate', 0)*100:.2f}%"
            delayed_rate = f"{metrics.get('delayed_handling_time', {}).get('rate', 0)*100:.2f}%"
            cancellations_rate = f"{metrics.get('cancellations', {}).get('rate', 0)*100:.2f}%"
            
            transactions = rep_detail.get('transactions', {})
            total_transactions = transactions.get('total', 0)

            print(f"Processing Site: {site_id}, Logistic: {logistic_type}, Level: {reputation_level}")

            # Update stores table mapping site_id
            cursor.execute("""
                UPDATE stores 
                SET reputation_level = ?, 
                    complaints_rate = ?, 
                    delayed_rate = ?, 
                    cancellations_rate = ?, 
                    total_transactions = ?
                WHERE site_id = ?
            """, (reputation_level, complaints_rate, delayed_rate, cancellations_rate, total_transactions, site_id))
            
            print(f"  Updated Database for {site_id} ({logistic_type})")

        conn.commit()
        conn.close()
        print("Global reputation sync complete.")

    except Exception as e:
        print(f"Exception during global sync: {e}")

    print("Reputation update complete.")

if __name__ == "__main__":
    pull_reputation()
