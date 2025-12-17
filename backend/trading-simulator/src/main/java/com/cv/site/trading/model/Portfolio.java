package com.cv.site.trading.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "portfolios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {

    public enum PositionType {
        LONG,   // Betting price goes up
        SHORT   // Betting price goes down
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String userId;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal capitalUSDT;  // Current capital value in USDT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PositionType positionType;  // LONG or SHORT

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal entryPrice;  // Price when position was opened

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal positionSize;  // Position size in USDT (always equals capitalUSDT in 1x leverage)

    @Column(nullable = false)
    private Instant lastUpdated;
}
