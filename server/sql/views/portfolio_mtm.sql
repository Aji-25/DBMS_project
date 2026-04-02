USE nexus_db;

CREATE OR REPLACE VIEW portfolio_mtm AS
SELECT 
    h.user_id,
    h.asset_id,
    a.symbol,
    a.name,
    h.quantity,
    h.avg_cost_basis,
    a.current_price,
    (h.quantity * a.current_price) AS market_value,
    (h.quantity * h.avg_cost_basis) AS book_value,
    ((h.quantity * a.current_price) - (h.quantity * h.avg_cost_basis)) AS unrealized_pnl,
    ROUND((((h.quantity * a.current_price) - (h.quantity * h.avg_cost_basis)) / NULLIF((h.quantity * h.avg_cost_basis), 0)) * 100, 2) AS pnl_pct
FROM 
    holdings h
JOIN 
    assets a ON h.asset_id = a.id;

-- Sample query:
-- SELECT * FROM portfolio_mtm WHERE user_id = 1;
