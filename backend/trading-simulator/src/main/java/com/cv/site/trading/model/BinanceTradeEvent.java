package com.cv.site.trading.model;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Trade event consumed from Binance topic
 */
public record BinanceTradeEvent(
    String symbol,
    Long tradeId,
    BigDecimal price,
    BigDecimal quantity,
    Instant timestamp,
    Boolean isBuyerMaker,
    String source
) {}
