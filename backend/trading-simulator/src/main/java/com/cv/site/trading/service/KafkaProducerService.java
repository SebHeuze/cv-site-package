package com.cv.site.trading.service;

import com.cv.site.trading.model.TradeEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, TradeEvent> kafkaTemplate;
    private final String topicName;

    public KafkaProducerService(
            KafkaTemplate<String, TradeEvent> kafkaTemplate,
            @Value("${kafka.topics.trading-events}") String topicName
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.topicName = topicName;
    }

    public void publishTradeEvent(TradeEvent event) {
        // Using record accessor methods
        kafkaTemplate.send(topicName, event.userId(), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.debug("Published trade event to Kafka: {} {} {}",
                                event.tradeType(), event.quantity(), event.symbol());
                    } else {
                        log.error("Failed to publish trade event to Kafka", ex);
                    }
                });
    }
}
