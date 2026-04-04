import pool from '../pool.js';

export const executeTradeProcedure = async (buyerId, sellerId, assetId, qty, executedPrice) => {
    const [rows] = await pool.query(
        'CALL execute_trade(?, ?, ?, ?, ?)',
        [buyerId, sellerId, assetId, qty, executedPrice]
    );

    return rows[0]?.[0] ?? null;
};

export const findMatchingOrder = async (assetId, side, qty, price) => {
    const oppositeSide = side === 'BUY' ? 'SELL' : 'BUY';
    const priceCondition = side === 'BUY'
        ? (price ? 'AND limit_price <= ?' : '')
        : (price ? 'AND limit_price >= ?' : '');

    const query = `
        SELECT * FROM orders 
        WHERE asset_id = ? 
        AND type = ? 
        AND status = 'OPEN'
        ${priceCondition}
        AND qty >= ?
        ORDER BY created_at ASC
        LIMIT 1
    `;

    const params = price ? [assetId, oppositeSide, price, qty] : [assetId, oppositeSide, qty];
    const [rows] = await pool.query(query, params);
    return rows[0] || null;
};

export const createOrder = async (userId, assetId, side, orderType, qty, limitPrice) => {
    console.log('createOrder Debug - userId:', userId, 'assetId:', assetId);
    const [result] = await pool.query(
        'INSERT INTO orders (user_id, asset_id, type, order_type, qty, limit_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, assetId, side, orderType, qty, limitPrice, 'OPEN']
    );
    return result.insertId;
};

export const updateOrderStatus = async (orderId, status) => {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
};

export const linkTradeToOrders = async (tradeId, buyOrderId, sellOrderId) => {
    await pool.query('UPDATE trades SET buy_order_id = ?, sell_order_id = ? WHERE id = ?', [buyOrderId, sellOrderId, tradeId]);
};
