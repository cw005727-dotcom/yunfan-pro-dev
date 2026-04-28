import sqlite3

DB_PATH = "/Users/chensan/yunfan-pro-dev/mercadolibre.db"

def cleanup_and_recalc():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Deduplicate table
    print("Deduplicating product_metrics...")
    cursor.execute("CREATE TABLE product_metrics_new AS SELECT * FROM product_metrics WHERE 1=0")
    # Insert unique rows based on item_id (keeping the one with max exposure)
    cursor.execute("""
        INSERT INTO product_metrics_new 
        SELECT * FROM product_metrics 
        GROUP BY item_id 
        HAVING ROWID = (SELECT MIN(ROWID) FROM product_metrics p2 WHERE p2.item_id = product_metrics.item_id)
    """)
    cursor.execute("DROP TABLE product_metrics")
    cursor.execute("ALTER TABLE product_metrics_new RENAME TO product_metrics")

    conn.commit()
    conn.close()
    
    # Now run the calculation script
    import calculate_trend_scores
    calculate_trend_scores.calculate()

if __name__ == "__main__":
    cleanup_and_recalc()
