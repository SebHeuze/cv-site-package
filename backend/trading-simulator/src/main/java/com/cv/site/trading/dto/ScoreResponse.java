package com.cv.site.trading.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreResponse {
    private Long id;
    private String userId;
    private String username;
    private Long survivalTimeSeconds;
    private BigDecimal finalCapital;
    private Instant achievedAt;
    private Integer tradeCount;
    private Integer rank;
}
