import {
    executeTradeProcedure,
    findMatchingOrder,
    createOrder,
    updateOrderStatus,
    linkTradeToOrders
} from '../db/queries/trades.js';
import pool from '../db/pool.js';

class TradeService {
    /**
     * Executes a trade by calling the stored procedure.
     * Maps MySQL errors to meaningful business errors.
     */
    static async execute(userId, tradeData) {
        console.log('TradeService.execute Trace - userId:', userId, 'tradeData:', tradeData);
        const { assetId, orderType, qty, limitPrice } = tradeData;
        const side = tradeData.type || tradeData.side;

        try {
            // 1. Try to find a matching counter-order
            const matchPrice = orderType === 'LIMIT' ? limitPrice : null;
            console.log('TradeService check match:', { assetId, side, qty, matchPrice });

            const match = await findMatchingOrder(assetId, side, qty, matchPrice);
            console.log('TradeService match result:', match);

            if (match) {
                // 2. Perform a real peer-to-peer trade
                const buyerId = side === 'BUY' ? userId : match.user_id;
                const sellerId = side === 'SELL' ? userId : match.user_id;

                const executedPrice = matchPrice || match.limit_price || match.executed_price || 0; // fallback but limit_price is best

                const result = await executeTradeProcedure(
                    buyerId,
                    sellerId,
                    assetId,
                    qty,
                    executedPrice
                );

                const tradeId = result?.tradeId ?? result?.trade_id;

                // Create a record for the current user's intent (already filled)
                const myOrderId = await createOrder(userId, assetId, side, orderType, qty, limitPrice);

                // Update match order to FILLED
                await updateOrderStatus(match.id, 'FILLED');
                await updateOrderStatus(myOrderId, 'FILLED');

                // Link orders to trade
                await linkTradeToOrders(tradeId,
                    side === 'BUY' ? myOrderId : match.id,
                    side === 'SELL' ? myOrderId : match.id
                );

                return {
                    tradeId,
                    status: 'FILLED',
                    executedPrice: executedPrice,
                    totalValue: executedPrice * qty
                };
            } else {
                // 3. No match found, just place an OPEN order
                const orderId = await createOrder(userId, assetId, side, orderType, qty, limitPrice);

                return {
                    orderId,
                    status: 'OPEN',
                    message: 'Order placed but no immediate match found. Waiting in order book.'
                };
            }
        } catch (error) {
            console.error('TradeService Error:', error);

            if (error.errno === 1213) {
                const err = new Error('Deadlock detected');
                err.status = 503;
                err.payload = { error: 'DEADLOCK_DETECTED', retryAfter: 500 };
                throw err;
            }

            if (error.sqlState === '45000') {
                const message = error.message.toLowerCase();
                const err = new Error(error.message);
                err.status = 409;
                err.payload = {
                    error: message.includes('holding')
                        ? 'INSUFFICIENT_HOLDINGS'
                        : 'INSUFFICIENT_FUNDS'
                };
                throw err;
            }

            throw error;
        }
    }
}

export default TradeService;
