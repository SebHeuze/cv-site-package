package com.cv.site.trading.service;

import com.cv.site.trading.model.BinanceTradeEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static java.util.concurrent.TimeUnit.SECONDS;

/**
 * Integration test: verifies that a BinanceTradeEvent consumed from Kafka
 * updates the PriceService's current price.
 */
@SpringBootTest
@ActiveProfiles("test")
@EmbeddedKafka(
        partitions = 1,
        topics = {"binance-btcusdt-trades", "trading-events"},
        bootstrapServersProperty = "spring.kafka.bootstrap-servers"
)
@TestPropertySource(properties = {
        "spring.kafka.consumer.auto-offset-reset=earliest",
        "kafka.topics.binance-trades=binance-btcusdt-trades"
})
@DirtiesContext
class PriceServiceIT {

    @MockitoBean
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private PriceService priceService;

    @Autowired
    private EmbeddedKafkaBroker embeddedKafkaBroker;

    private DefaultKafkaProducerFactory<String, BinanceTradeEvent> testProducerFactory;
    private KafkaTemplate<String, BinanceTradeEvent> testProducer;

    @BeforeEach
    void setUp() {
        ObjectMapper mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, embeddedKafkaBroker.getBrokersAsString());
        testProducerFactory = new DefaultKafkaProducerFactory<>(
                props,
                new StringSerializer(),
                new JsonSerializer<>(mapper)
        );
        testProducer = new KafkaTemplate<>(testProducerFactory);
    }

    @AfterEach
    void tearDown() {
        testProducerFactory.destroy();
    }

    @Test
    void consumeBinanceTrade_shouldUpdateCurrentPrice() {
        BigDecimal expectedPrice = new BigDecimal("65000.00");
        BinanceTradeEvent event = new BinanceTradeEvent(
                "BTCUSDT", 999L, expectedPrice,
                new BigDecimal("0.01"), Instant.now(), false, "binance"
        );

        testProducer.send("binance-btcusdt-trades", "999", event);

        await().atMost(10, SECONDS).untilAsserted(() ->
                assertThat(priceService.getCurrentPrice())
                        .isEqualByComparingTo(expectedPrice)
        );
    }

    @Test
    void getCurrentPrice_returnsDefaultWhenNoPriceReceived() {
        // Before any Kafka message, the service returns the hardcoded default
        BigDecimal price = priceService.getCurrentPrice();
        assertThat(price).isPositive();
    }
}
