package com.cv.site.trading.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "game_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private Instant startTime;

    @Column
    private Instant endTime;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal initialCapital;

    @Column(precision = 20, scale = 2)
    private BigDecimal finalCapital;

    @Column(nullable = false)
    private Boolean alive;

    @Column(nullable = false)
    @Builder.Default
    private Integer tradeCount = 0;

    @Column
    private Long survivalTimeSeconds;

    @PrePersist
    protected void onCreate() {
        if (startTime == null) {
            startTime = Instant.now();
        }
        if (alive == null) {
            alive = true;
        }
    }

    public void endGame(BigDecimal finalCapital) {
        this.endTime = Instant.now();
        this.finalCapital = finalCapital;
        this.alive = false;
        this.survivalTimeSeconds = endTime.getEpochSecond() - startTime.getEpochSecond();
    }

    public void incrementTradeCount() {
        this.tradeCount++;
    }
}
