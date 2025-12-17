package com.cv.site.trading.dto;

import java.math.BigDecimal;

/**
 * Candlestick data for chart initialization
 */
public record CandlestickDto(
    long time,           // Unix timestamp in seconds
    BigDecimal open,
    BigDecimal high,
    BigDecimal low,
    BigDecimal close
) {
    public static CandlestickDto fromPrice(long time, BigDecimal price) {
        return new CandlestickDto(time, price, price, price, price);
    }
}
