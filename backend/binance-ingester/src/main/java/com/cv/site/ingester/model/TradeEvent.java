package com.cv.site.ingester.model;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Simplified trade event for Kafka topic
 */
public record TradeEvent(
    String symbol,
    Long tradeId,
    BigDecimal price,
    BigDecimal quantity,
    Instant timestamp,
    Boolean isBuyerMaker,
    String source  // "binance"
) {
    public static TradeEvent fromBinanceAggTrade(BinanceAggTrade aggTrade) {
        return new TradeEvent(
                aggTrade.symbol(),
                aggTrade.aggregateTradeId(),
                new BigDecimal(aggTrade.price()),
                new BigDecimal(aggTrade.quantity()),
                Instant.ofEpochMilli(aggTrade.tradeTime()),
                aggTrade.isBuyerMaker(),
                "binance"
        );
    }
}
