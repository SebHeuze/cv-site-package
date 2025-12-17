package com.cv.site.trading.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

import com.cv.site.trading.model.Portfolio;

/**
 * Portfolio response DTO for futures-style trading
 */
public record PortfolioResponse(
    String userId,
    BigDecimal currentBtcValue,      // Current total value
    BigDecimal unrealizedPnl,        // Current unrealized P&L
    BigDecimal totalPnl,             // Total P&L (currentValue - 10000)
    BigDecimal currentBtcPrice,
    String positionType,             // LONG or SHORT
    BigDecimal entryPrice,           // Entry price of current position
    BigDecimal positionSize,         // Position size in USDT
    BigDecimal capitalUSDT,          // Current capital in USDT
    Instant lastUpdated
) {
    public static PortfolioResponse fromPortfolio(Portfolio portfolio, BigDecimal currentPrice) {
        BigDecimal INITIAL_CAPITAL = new BigDecimal("10000.00");
        BigDecimal LEVERAGE = new BigDecimal("1000");

        // Calculate P&L based on position type with 500x leverage
        BigDecimal priceDiff;
        BigDecimal priceChangePercent;
        BigDecimal unrealizedPnl;

        if (portfolio.getPositionType() == Portfolio.PositionType.LONG) {
            // For LONG: P&L = (currentPrice - entryPrice) / entryPrice * positionSize * leverage
            priceDiff = currentPrice.subtract(portfolio.getEntryPrice());
            priceChangePercent = priceDiff.divide(portfolio.getEntryPrice(), 8, RoundingMode.HALF_UP);
            unrealizedPnl = priceChangePercent.multiply(portfolio.getPositionSize()).multiply(LEVERAGE);
        } else {
            // For SHORT: P&L = (entryPrice - currentPrice) / entryPrice * positionSize * leverage
            priceDiff = portfolio.getEntryPrice().subtract(currentPrice);
            priceChangePercent = priceDiff.divide(portfolio.getEntryPrice(), 8, RoundingMode.HALF_UP);
            unrealizedPnl = priceChangePercent.multiply(portfolio.getPositionSize()).multiply(LEVERAGE);
        }

        // Current total value = capital + unrealized P&L
        BigDecimal currentValue = portfolio.getCapitalUSDT().add(unrealizedPnl);

        // Total P&L is current value minus initial capital (10000)
        BigDecimal totalPnl = currentValue.subtract(INITIAL_CAPITAL);

        return new PortfolioResponse(
                portfolio.getUserId(),
                currentValue,            // Current total value
                unrealizedPnl,           // Current unrealized P&L
                totalPnl,                // Total P&L
                currentPrice,
                portfolio.getPositionType().name(), // LONG or SHORT
                portfolio.getEntryPrice(),
                portfolio.getPositionSize(),
                portfolio.getCapitalUSDT(),
                portfolio.getLastUpdated()
        );
    }
}
