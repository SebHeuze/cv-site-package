package com.cv.site.ingester.service;

import com.cv.site.ingester.model.TradeEvent;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for KafkaProducerService.
 * Verifies that trade events are actually produced to the Kafka topic.
 */
@SpringBootTest
@EmbeddedKafka(
        partitions = 1,
        topics = {"binance-btcusdt-trades"},
        bootstrapServersProperty = "spring.kafka.bootstrap-servers"
)
@TestPropertySource(properties = {
        "kafka.topics.binance-trades=binance-btcusdt-trades"
})
@DirtiesContext
class KafkaProducerServiceIT {

    @MockitoBean
    private BinanceWebSocketClient binanceWebSocketClient;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @Autowired
    private EmbeddedKafkaBroker embeddedKafkaBroker;

    private Consumer<String, String> consumer;

    @BeforeEach
    void setUp() {
        Map<String, Object> consumerProps = KafkaTestUtils.consumerProps("it-consumer", "true", embeddedKafkaBroker);
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumer = new DefaultKafkaConsumerFactory<String, String>(consumerProps).createConsumer();
        embeddedKafkaBroker.consumeFromAnEmbeddedTopic(consumer, "binance-btcusdt-trades");
        // Initial poll to trigger partition assignment
        consumer.poll(Duration.ofMillis(200));
    }

    @AfterEach
    void tearDown() {
        consumer.close();
    }

    @Test
    void sendTradeEvent_shouldProduceMessageToKafka() {
        TradeEvent tradeEvent = new TradeEvent(
                "BTCUSDT",
                123456789L,
                new BigDecimal("50000.00"),
                new BigDecimal("0.001"),
                Instant.now(),
                false,
                "binance"
        );

        kafkaProducerService.sendTradeEvent(tradeEvent);

        ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(10));
        assertThat(records.count()).isGreaterThan(0);

        ConsumerRecord<String, String> record = records.iterator().next();
        assertThat(record.key()).isEqualTo("123456789");
        assertThat(record.value()).contains("BTCUSDT").contains("50000.00");
    }
}
