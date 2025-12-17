package com.cv.site.ingester.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Value("${kafka.topics.binance-trades}")
    private String binanceTradesTopic;

    @Bean
    public NewTopic binanceTradesTopic() {
        return TopicBuilder.name(binanceTradesTopic)
                .partitions(3)
                .replicas(3)
                .config("retention.ms", "604800000") // 7 days
                .build();
    }
}
