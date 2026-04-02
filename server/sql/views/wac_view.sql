USE nexus_db;

CREATE OR REPLACE VIEW wac_view AS
SELECT 
    h.user_id,
    h.asset_id,
    a.symbol,
    h.quantity,
    h.avg_cost_basis,
    (h.quantity * h.avg_cost_basis) AS total_invested
FROM 
    holdings h
JOIN 
    assets a ON h.asset_id = a.id;

-- Sample query:
-- SELECT * FROM wac_view WHERE user_id = 1;
