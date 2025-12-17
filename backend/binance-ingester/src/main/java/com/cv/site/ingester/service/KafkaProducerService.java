package com.cv.site.ingester.service;

import com.cv.site.ingester.model.TradeEvent;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, TradeEvent> kafkaTemplate;
    private final String topicName;
    private final Counter messagesProducedCounter;
    private final Counter messagesFailedCounter;
    private final Timer publishLatencyTimer;

    public KafkaProducerService(
            KafkaTemplate<String, TradeEvent> kafkaTemplate,
            @Value("${kafka.topics.binance-trades}") String topicName,
            MeterRegistry meterRegistry
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.topicName = topicName;

        // Custom metrics
        this.messagesProducedCounter = Counter.builder("binance.trades.produced")
                .description("Number of trades successfully produced to Kafka")
                .register(meterRegistry);

        this.messagesFailedCounter = Counter.builder("binance.trades.failed")
                .description("Number of trades failed to produce to Kafka")
                .register(meterRegistry);

        this.publishLatencyTimer = Timer.builder("binance.kafka.publish.latency")
                .description("Latency of publishing trades to Kafka")
                .register(meterRegistry);
    }

    public void sendTradeEvent(TradeEvent tradeEvent) {
        publishLatencyTimer.record(() -> {
            try {
                // Using record accessor methods instead of getters
                CompletableFuture<SendResult<String, TradeEvent>> future =
                        kafkaTemplate.send(topicName, tradeEvent.tradeId().toString(), tradeEvent);

                future.whenComplete((result, ex) -> {
                    if (ex == null) {
                        messagesProducedCounter.increment();
                        log.debug("Trade sent to Kafka: {} @ {} (partition: {})",
                                tradeEvent.symbol(),
                                tradeEvent.price(),
                                result.getRecordMetadata().partition());
                    } else {
                        messagesFailedCounter.increment();
                        log.error("Failed to send trade to Kafka: {}", tradeEvent, ex);
                    }
                });
            } catch (Exception e) {
                messagesFailedCounter.increment();
                log.error("Error sending trade to Kafka: {}", tradeEvent, e);
            }
        });
    }
}
