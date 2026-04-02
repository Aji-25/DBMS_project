import pool from '../pool.js';

export const getPortfolioMtm = async (userId) => {
    const [rows] = await pool.query('SELECT * FROM portfolio_mtm WHERE user_id = ?', [userId]);
    return rows;
};

export const getCashBalance = async (userId) => {
    const [rows] = await pool.query('SELECT balance FROM wallets WHERE user_id = ?', [userId]);
    return rows.length ? rows[0].balance : 0;
};

export const getPriceHistory = async (assetId, days) => {
    const [rows] = await pool.query(
        'SELECT price, recorded_at FROM price_history WHERE asset_id = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY recorded_at ASC',
        [assetId, days]
    );
    return rows;
};

export const getSymbolByAssetId = async (assetId) => {
    const [rows] = await pool.query('SELECT symbol FROM assets WHERE id = ?', [assetId]);
    return rows.length ? rows[0].symbol : null;
};
