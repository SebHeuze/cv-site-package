package com.cv.site.trading.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "trades")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TradeType type;  // BUY or SELL

    @Column(nullable = false)
    private String symbol;  // BTCUSDT

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal price;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal fee;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal totalAmount;  // quantity * price + fee (for buy) or - fee (for sell)

    @Column(nullable = false)
    private Instant timestamp;

    public enum TradeType {
        BUY, SELL
    }
}
