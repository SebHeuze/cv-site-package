package com.cv.site.trading.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

import org.apache.kafka.common.TopicPartition;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.listener.ConsumerSeekAware;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.cv.site.trading.dto.CandlestickDto;
import com.cv.site.trading.dto.PriceUpdateDto;
import com.cv.site.trading.dto.TradeTickDto;
import com.cv.site.trading.model.BinanceTradeEvent;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service to track the latest BTC price from Binance trades
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceService implements ConsumerSeekAware {

    @Getter
    private final AtomicReference<BigDecimal> latestPrice = new AtomicReference<>(BigDecimal.ZERO);

    private final SimpMessagingTemplate messagingTemplate;

    // Store candlesticks per second for the last 1 hour (3600 seconds)
    private final Map<Long, CandlestickData> priceHistory = new ConcurrentHashMap<>();
    private static final int HISTORY_DURATION_SECONDS = 3600; // 1 hour

    // Helper class to track OHLC data per second
    private static class CandlestickData {
        BigDecimal open;
        BigDecimal high;
        BigDecimal low;
        BigDecimal close;

        CandlestickData(BigDecimal price) {
            this.open = price;
            this.high = price;
            this.low = price;
            this.close = price;
        }

        void update(BigDecimal price) {
            if (price.compareTo(high) > 0) high = price;
            if (price.compareTo(low) < 0) low = price;
            close = price;
        }
    }

    @KafkaListener(
            topics = "${kafka.topics.binance-trades}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeBinanceTrade(BinanceTradeEvent tradeEvent) {
        // Using record accessor methods (price() instead of getPrice())
        if (tradeEvent != null && tradeEvent.price() != null && tradeEvent.timestamp() != null) {
            latestPrice.set(tradeEvent.price());
            log.debug("Updated latest BTC price: {} at {}", tradeEvent.price(), tradeEvent.timestamp());

            // Update price history (candlestick per second) using the trade's actual timestamp
            long tradeSecond = tradeEvent.timestamp().getEpochSecond();
            priceHistory.compute(tradeSecond, (key, existing) -> {
                if (existing == null) {
                    return new CandlestickData(tradeEvent.price());
                } else {
                    existing.update(tradeEvent.price());
                    return existing;
                }
            });

            // Clean up old data (older than 5 minutes from the current time)
            long currentSecond = Instant.now().getEpochSecond();
            long cutoffTime = currentSecond - HISTORY_DURATION_SECONDS;
            priceHistory.entrySet().removeIf(entry -> entry.getKey() < cutoffTime);

            // Broadcast price update via WebSocket
            PriceUpdateDto priceUpdate = PriceUpdateDto.from(tradeEvent.price(), "BTCUSDT");
            messagingTemplate.convertAndSend("/topic/price", priceUpdate);

            // Broadcast individual trade tick for the trade feed
            TradeTickDto tradeTick = TradeTickDto.from(tradeEvent);
            messagingTemplate.convertAndSend("/topic/trades", tradeTick);
        }
    }

    public BigDecimal getCurrentPrice() {
        BigDecimal price = latestPrice.get();
        if (price.compareTo(BigDecimal.ZERO) == 0) {
            log.warn("No price data available yet, returning default price");
            return new BigDecimal("50000.00"); // Default fallback
        }
        return price;
    }

    /**
     * Get price history for the last 5 minutes as candlestick data
     */
    public List<CandlestickDto> getPriceHistory() {
        List<CandlestickDto> history = new ArrayList<>();

        // Convert the history map to a sorted list of candlesticks
        priceHistory.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    CandlestickData data = entry.getValue();
                    history.add(new CandlestickDto(
                            entry.getKey(),
                            data.open,
                            data.high,
                            data.low,
                            data.close
                    ));
                });

        log.info("Returning {} candlesticks for price history", history.size());
        return history;
    }

    /**
     * Seek back 1000 messages from the end when the consumer starts
     * This pre-populates the price history buffer
     */
    @Override
    public void onPartitionsAssigned(Map<TopicPartition, Long> assignments, ConsumerSeekCallback callback) {
        assignments.forEach((partition, offset) -> {
            long newOffset = Math.max(0, offset - 10000);
            log.info("Seeking partition {} from offset {} back to offset {} to pre-load historical data",
                    partition, offset, newOffset);
            callback.seek(partition.topic(), partition.partition(), newOffset);
        });
    }
}
