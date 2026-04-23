package com.cv.site.ingester.health;

import com.cv.site.ingester.service.BinanceWebSocketClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("binanceStream")
public class BinanceStreamHealthIndicator implements HealthIndicator {

    private final BinanceWebSocketClient webSocketClient;
    private final long staleThresholdMs;

    public BinanceStreamHealthIndicator(
            BinanceWebSocketClient webSocketClient,
            @Value("${binance.websocket.stale-threshold-ms:120000}") long staleThresholdMs
    ) {
        this.webSocketClient = webSocketClient;
        this.staleThresholdMs = staleThresholdMs;
    }

    @Override
    public Health health() {
        long ageMs = webSocketClient.getLastMessageAgeMs();
        boolean connected = webSocketClient.isConnected();

        Health.Builder builder = (ageMs >= 0 && ageMs <= staleThresholdMs)
                ? Health.up()
                : Health.down();

        return builder
                .withDetail("connected", connected)
                .withDetail("lastMessageAgeMs", ageMs)
                .withDetail("staleThresholdMs", staleThresholdMs)
                .build();
    }
}
