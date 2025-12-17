package com.cv.site.trading.dto;

import com.cv.site.trading.model.Trade;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Trade response DTO
 */
public record TradeResponse(
    Long tradeId,
    String type,
    String symbol,
    BigDecimal price,
    BigDecimal quantity,
    BigDecimal fee,
    BigDecimal totalAmount,
    Instant timestamp,
    String message
) {
    public static TradeResponse fromTrade(Trade trade, String message) {
        return new TradeResponse(
                trade.getId(),
                trade.getType().name(),
                trade.getSymbol(),
                trade.getPrice(),
                trade.getQuantity(),
                trade.getFee(),
                trade.getTotalAmount(),
                trade.getTimestamp(),
                message
        );
    }

    // Factory method for error responses
    public static TradeResponse error(String message) {
        return new TradeResponse(null, null, null, null, null, null, null, null, message);
    }
}
