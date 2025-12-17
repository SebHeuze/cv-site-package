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
public class GameSessionResponse {
    private String id;
    private String userId;
    private Instant startTime;
    private Instant endTime;
    private BigDecimal initialCapital;
    private BigDecimal finalCapital;
    private Boolean alive;
    private Integer tradeCount;
    private Long survivalTimeSeconds;
}
