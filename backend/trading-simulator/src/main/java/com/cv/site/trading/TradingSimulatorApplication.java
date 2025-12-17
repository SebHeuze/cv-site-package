package com.cv.site.trading;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class TradingSimulatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(TradingSimulatorApplication.class, args);
    }
}
