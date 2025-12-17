package com.cv.site.trading.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStatusResponse {
    private GameSessionResponse session;
    private PortfolioResponse portfolio;
    private BigDecimal currentPrice;
    private Boolean alive;
}
