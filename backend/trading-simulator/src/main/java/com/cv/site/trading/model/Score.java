package com.cv.site.trading.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "scores",
        indexes = {
            @Index(name = "idx_survival_time", columnList = "survivalTimeSeconds DESC"),
            @Index(name = "idx_achieved_at", columnList = "achievedAt DESC")
        })
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private Long survivalTimeSeconds;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal finalCapital;

    @Column(nullable = false)
    private Instant achievedAt;

    @Column(nullable = false)
    private Integer tradeCount;

    @PrePersist
    protected void onCreate() {
        if (achievedAt == null) {
            achievedAt = Instant.now();
        }
    }
}
