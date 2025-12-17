package com.cv.site.trading.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.cv.site.trading.model.BinanceTradeEvent;

/**
 * DTO for individual trade ticks to display in the trade feed
 */
public record TradeTickDto(
    Long tradeId,
    BigDecimal price,
    BigDecimal quantity,
    Instant timestamp,
    Boolean isBuyerMaker  // true = sell (red), false = buy (green)
) {
    public static TradeTickDto from(BinanceTradeEvent event) {
        return new TradeTickDto(
            event.tradeId(),
            event.price(),
            event.quantity(),
            event.timestamp(),
            event.isBuyerMaker()
        );
    }
}
