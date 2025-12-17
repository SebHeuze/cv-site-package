package com.cv.site.trading.model;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Event published to Kafka when a trade is executed
 */
public record TradeEvent(
    String userId,
    String tradeType,  // BUY or SELL
    String symbol,
    BigDecimal price,
    BigDecimal quantity,
    BigDecimal fee,
    BigDecimal totalAmount,
    Instant timestamp,
    String source  // "trading-simulator"
) {}
