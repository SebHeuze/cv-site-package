package com.cv.site.ingester.service;

import com.cv.site.ingester.model.BinanceAggTrade;
import com.cv.site.ingester.model.TradeEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocketListener;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import okhttp3.WebSocket;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Service
public class BinanceWebSocketClient extends WebSocketListener {

    private final String websocketUrl;
    private final long reconnectDelayMs;
    private final long pingIntervalSec;
    private final KafkaProducerService kafkaProducerService;
    private final ObjectMapper objectMapper;
    private final OkHttpClient httpClient;

    private volatile WebSocket webSocket;
    private final AtomicInteger reconnectAttempts = new AtomicInteger(0);
    private final AtomicLong lastMessageTime = new AtomicLong(0);
    private final AtomicInteger connectionStatus = new AtomicInteger(0); // 0=disconnected, 1=connected
    private final AtomicBoolean isReconnecting = new AtomicBoolean(false);

    private final Counter messagesReceivedCounter;
    private final Counter reconnectionCounter;
    private final Counter parseErrorCounter;

    public BinanceWebSocketClient(
            @Value("${binance.websocket.url}") String websocketUrl,
            @Value("${binance.websocket.reconnect-delay-ms}") long reconnectDelayMs,
            @Value("${binance.websocket.ping-interval-sec:30}") long pingIntervalSec,
            KafkaProducerService kafkaProducerService,
            ObjectMapper objectMapper,
            MeterRegistry meterRegistry
    ) {
        this.websocketUrl = websocketUrl;
        this.reconnectDelayMs = reconnectDelayMs;
        this.pingIntervalSec = pingIntervalSec;
        this.kafkaProducerService = kafkaProducerService;
        this.objectMapper = objectMapper;

        this.httpClient = new OkHttpClient.Builder()
                .readTimeout(0, TimeUnit.MILLISECONDS)
                .pingInterval(pingIntervalSec, TimeUnit.SECONDS)
                .build();

        // Grace period at boot: pretend a message just arrived so the liveness
        // indicator doesn't immediately mark DOWN before the first real trade.
        this.lastMessageTime.set(System.currentTimeMillis());

        // Metrics
        this.messagesReceivedCounter = Counter.builder("binance.websocket.messages.received")
                .description("Number of messages received from Binance WebSocket")
                .register(meterRegistry);

        this.reconnectionCounter = Counter.builder("binance.websocket.reconnections")
                .description("Number of WebSocket reconnections")
                .register(meterRegistry);

        this.parseErrorCounter = Counter.builder("binance.websocket.parse.errors")
                .description("Number of JSON parse errors")
                .register(meterRegistry);

        Gauge.builder("binance.websocket.connection.status", connectionStatus, AtomicInteger::get)
                .description("WebSocket connection status (0=disconnected, 1=connected)")
                .register(meterRegistry);

        Gauge.builder("binance.websocket.last.message.age.seconds", () -> {
                    long lastMsg = lastMessageTime.get();
                    return lastMsg > 0 ? (System.currentTimeMillis() - lastMsg) / 1000.0 : -1;
                })
                .description("Seconds since last message received")
                .register(meterRegistry);
    }

    @PostConstruct
    public void connect() {
        log.info("Connecting to Binance WebSocket: {}", websocketUrl);
        Request request = new Request.Builder().url(websocketUrl).build();
        webSocket = httpClient.newWebSocket(request, this);
    }

    @PreDestroy
    public void disconnect() {
        log.info("Disconnecting from Binance WebSocket");
        if (webSocket != null) {
            webSocket.close(1000, "Application shutdown");
        }
        httpClient.dispatcher().executorService().shutdown();
        try {
            if (!httpClient.dispatcher().executorService().awaitTermination(5, TimeUnit.SECONDS)) {
                httpClient.dispatcher().executorService().shutdownNow();
            }
        } catch (InterruptedException e) {
            httpClient.dispatcher().executorService().shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    @Override
    public void onOpen(WebSocket webSocket, Response response) {
        // Java 21+ Text Block for better formatted log messages
        String connectionMessage = """
                WebSocket Connection Established:
                - URL: %s
                - Status: Connected
                - Reconnect attempts reset to 0
                """.formatted(websocketUrl);
        log.info(connectionMessage.trim());

        reconnectAttempts.set(0);
        connectionStatus.set(1);
        isReconnecting.set(false);
    }

    @Override
    public void onMessage(WebSocket webSocket, String text) {
        try {
            messagesReceivedCounter.increment();
            lastMessageTime.set(System.currentTimeMillis());

            BinanceAggTrade aggTrade = objectMapper.readValue(text, BinanceAggTrade.class);
            TradeEvent tradeEvent = TradeEvent.fromBinanceAggTrade(aggTrade);

            kafkaProducerService.sendTradeEvent(tradeEvent);

        } catch (Exception e) {
            parseErrorCounter.increment();
            log.error("Error parsing Binance message: {}", text, e);
        }
    }

    @Override
    public void onFailure(WebSocket webSocket, Throwable t, Response response) {
        log.error("WebSocket connection failed", t);
        connectionStatus.set(0);
        reconnect();
    }

    @Override
    public void onClosing(WebSocket webSocket, int code, String reason) {
        log.warn("WebSocket closing: {} - {}", code, reason);
        connectionStatus.set(0);
        webSocket.close(1000, null);
    }

    @Override
    public void onClosed(WebSocket webSocket, int code, String reason) {
        log.warn("WebSocket closed: {} - {}", code, reason);
        connectionStatus.set(0);
        reconnect();
    }

    private void reconnect() {
        // Prevent multiple concurrent reconnection attempts
        if (!isReconnecting.compareAndSet(false, true)) {
            log.debug("Reconnection already in progress, skipping duplicate attempt");
            return;
        }

        int attempts = reconnectAttempts.incrementAndGet();
        reconnectionCounter.increment();
        log.info("Attempting to reconnect (attempt #{}) in {}ms", attempts, reconnectDelayMs);

        // Free the previous WebSocket so OkHttp releases its resources
        WebSocket previous = this.webSocket;
        if (previous != null) {
            try {
                previous.cancel();
            } catch (Exception e) {
                log.debug("Failed to cancel previous websocket (ignored): {}", e.getMessage());
            }
        }

        // Use Java 21 Virtual Threads for non-blocking reconnection
        Thread.ofVirtual().start(() -> {
            try {
                Thread.sleep(reconnectDelayMs);
                connect();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Reconnection interrupted", e);
                isReconnecting.set(false);
            }
        });
    }

    /** Milliseconds since the last message was received, or -1 if none received yet. */
    public long getLastMessageAgeMs() {
        long last = lastMessageTime.get();
        return last > 0 ? System.currentTimeMillis() - last : -1;
    }

    public boolean isConnected() {
        return connectionStatus.get() == 1;
    }
}
