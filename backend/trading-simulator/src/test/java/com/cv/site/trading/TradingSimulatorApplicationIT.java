package com.cv.site.trading;

import com.cv.site.trading.model.TradeEvent;
import com.cv.site.trading.service.PriceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies the full Spring application context starts successfully with:
 * - JPA (H2 in test profile)
 * - Kafka consumer + producer (embedded broker)
 * - WebSocket message broker
 */
@SpringBootTest
@ActiveProfiles("test")
@EmbeddedKafka(
        partitions = 1,
        topics = {"binance-btcusdt-trades", "trading-events"},
        bootstrapServersProperty = "spring.kafka.bootstrap-servers"
)
@DirtiesContext
class TradingSimulatorApplicationIT {

    @MockitoBean
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private KafkaTemplate<String, TradeEvent> kafkaTemplate;

    @Autowired
    private PriceService priceService;

    @Test
    void contextLoads() {
        assertThat(kafkaTemplate).isNotNull();
        assertThat(priceService).isNotNull();
    }
}
