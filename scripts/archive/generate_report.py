from ml_api_client import MercadoLibreClient
import json
from datetime import datetime

CLIENT_ID = "4704295209384526"
CLIENT_SECRET = "wkHjcxmX5Pn8VZISfvkwj5rZBUcngAJN"
REDIRECT_URI = "https://www.baidu.com"
SELLER_ID = "2588663725"

client = MercadoLibreClient(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

def get_comprehensive_report():
    report = {}

    # --- 1. Order Class (No date filter for debugging) ---
    print("Fetching ALL Order Data for debugging...")
    orders_data = client.fetch_orders(SELLER_ID, limit=50)
    print(f"DEBUG - Full Order Response: {json.dumps(orders_data, indent=2)}")
    orders = orders_data.get('results', [])
    orders = orders_data.get('results', [])
    
    report['order_metrics'] = {
        'total_count': len(orders),
        'total_amount': sum(o.get('total_amount', 0) for o in orders),
        'net_proceeds_sum': sum(o.get('paid_amount', 0) for o in orders), # Placeholder for net
        'orders': []
    }
    
    for o in orders:
        shipment_id = o.get('shipping', {}).get('id')
        late_shipping = "N/A"
        if shipment_id:
            s_detail = client.fetch_shipment(shipment_id)
            late_shipping = s_detail.get('shipping_option', {}).get('estimated_delivery_limit', {}).get('date', 'N/A')
        
        report['order_metrics']['orders'].append({
            'id': o.get('id'),
            'amount': o.get('total_amount'),
            'status': o.get('status'),
            'late_shipping_time': late_shipping
        })

    # --- 2. Reputation Class ---
    print("Fetching Reputation Data...")
    reputation = client.fetch_reputation(SELLER_ID)
    report['reputation'] = {
        'level': reputation.get('level_id'),
        'metrics': reputation.get('metrics', {}),
        'transactions': reputation.get('transactions', {})
    }
    
    # Claims/Complaints
    claims = client.fetch_claims(SELLER_ID)
    report['reputation']['claims_count'] = claims.get('paging', {}).get('total', 0)

    # --- 3. Data Class (Traffic & Financial) ---
    print("Fetching Financial Data...")
    # This often uses the /payouts or /payouts/search endpoint
    pending_payouts = client.fetch_payouts(SELLER_ID, status='pending')
    paid_payouts = client.fetch_payouts(SELLER_ID, status='paid')
    
    report['financials'] = {
        'pending_amount': pending_payouts.get('paging', {}).get('total', 0), # Simplified for example
        'paid_amount': paid_payouts.get('paging', {}).get('total', 0)
    }

    return report

if __name__ == "__main__":
    full_report = get_comprehensive_report()
    with open('ml_full_report.json', 'w', encoding='utf-8') as f:
        json.dump(full_report, f, indent=2, ensure_ascii=False)
    print("\nReport generated: ml_full_report.json")
