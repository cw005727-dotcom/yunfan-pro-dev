import sqlite3

import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mercadolibre.db")

def calculate():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Reset scores
    cursor.execute("UPDATE product_metrics SET trend_score = 0.0")

    # 2. Get all trends
    cursor.execute("SELECT site_id, keyword, rank FROM market_trends")
    trends_by_site = {}
    all_trends = [] # For CBT products
    for row in cursor.fetchall():
        site = row['site_id']
        t_data = {'kw': row['keyword'].lower(), 'rank': row['rank']}
        if site not in trends_by_site:
            trends_by_site[site] = []
        trends_by_site[site].append(t_data)
        all_trends.append(t_data)

    # 3. Get all products
    cursor.execute("SELECT item_id, name, site_id FROM product_metrics")
    products = cursor.fetchall()

    updates = []
    print(f"Calculating scores for {len(products)} products...")
    
    for p in products:
        item_id = p['item_id']
        name = p['name'].lower()
        site = p['site_id']
        
        score = 0.0
        # If product is CBT, match against ALL available trends to find any relevance
        # (Since CBT items often appear across multiple sites)
        target_trends = trends_by_site.get(site, all_trends)
        
        seen_kws = set()
        for t in target_trends:
            if t['kw'] in name and t['kw'] not in seen_kws:
                # Algorithm: 100 / rank. Accumulate for multiple keyword matches.
                score += (100.0 / t['rank'])
                seen_kws.add(t['kw'])
        
        if score > 0:
            updates.append((score, item_id))

    # 4. Batch update
    print(f"Updating {len(updates)} products with score > 0...")
    cursor.executemany("UPDATE product_metrics SET trend_score = ? WHERE item_id = ?", updates)
    
    # 5. Reset and Re-apply is_core=1 for TOP 50 only
    print("Resetting is_core and applying top 50 by exposure...")
    cursor.execute("UPDATE product_metrics SET is_core = 0")
    cursor.execute("""
        UPDATE product_metrics 
        SET is_core = 1 
        WHERE item_id IN (
            SELECT item_id FROM product_metrics 
            ORDER BY exposure DESC 
            LIMIT 50
        )
    """)
    
    conn.commit()
    conn.close()
    print("Trend scores and is_core updated successfully.")

if __name__ == "__main__":
    calculate()
