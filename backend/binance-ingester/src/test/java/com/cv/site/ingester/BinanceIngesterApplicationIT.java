package com.cv.site.ingester;

import com.cv.site.ingester.model.TradeEvent;
import com.cv.site.ingester.service.BinanceWebSocketClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies the Spring application context starts successfully and all beans are wired.
 * Uses embedded Kafka to avoid requiring a real broker.
 */
@SpringBootTest
@EmbeddedKafka(
        partitions = 1,
        topics = {"binance-btcusdt-trades"},
        bootstrapServersProperty = "spring.kafka.bootstrap-servers"
)
@DirtiesContext
class BinanceIngesterApplicationIT {

    @MockitoBean
    private BinanceWebSocketClient binanceWebSocketClient;

    @Autowired
    private KafkaTemplate<String, TradeEvent> kafkaTemplate;

    @Test
    void contextLoads() {
        assertThat(kafkaTemplate).isNotNull();
    }
}
