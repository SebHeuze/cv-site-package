package com.cv.site.trading.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Trade request DTO
 * @param quantity The quantity to trade
 * @param userId Optional user ID, defaults to demo-user
 */
public record TradeRequest(
    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0001", message = "Quantity must be at least 0.0001")
    BigDecimal quantity,
    String userId  // Optional, defaults to demo-user
) {}
