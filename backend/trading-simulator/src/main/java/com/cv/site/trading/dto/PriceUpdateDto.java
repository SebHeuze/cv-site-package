package com.cv.site.trading.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Real-time price update DTO for WebSocket broadcasts
 */
public record PriceUpdateDto(
    BigDecimal price,
    String symbol,
    Instant timestamp
) {
    public static PriceUpdateDto from(BigDecimal price, String symbol) {
        return new PriceUpdateDto(price, symbol, Instant.now());
    }
}
