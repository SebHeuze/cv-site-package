package com.cv.site.trading.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

/**
 * WebSocket configuration for real-time price updates
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker to send messages to clients
        config.enableSimpleBroker("/topic");
        // Prefix for messages from clients
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoint that clients will connect to
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // For development; configure properly in production
                .withSockJS()  // Enable SockJS fallback with all transports
                .setSessionCookieNeeded(false)
                .setStreamBytesLimit(512 * 1024)
                .setHttpMessageCacheSize(1000)
                .setDisconnectDelay(30 * 1000);

        // Also add endpoint without SockJS for direct WebSocket connections
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        // Configure WebSocket transport options
        registration.setMessageSizeLimit(128 * 1024); // 128 KB
        registration.setSendBufferSizeLimit(512 * 1024); // 512 KB
        registration.setSendTimeLimit(20 * 1000); // 20 seconds
    }
}
