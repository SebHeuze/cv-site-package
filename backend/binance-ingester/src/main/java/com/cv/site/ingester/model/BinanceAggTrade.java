package com.cv.site.ingester.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Binance WebSocket Aggregate Trade message
 * Example: {"e":"aggTrade","E":1638747660000,"s":"BTCUSDT","a":12345,"p":"50000.00","q":"0.5","f":100,"l":105,"T":1638747660000,"m":true,"M":true}
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record BinanceAggTrade(
    @JsonProperty("e") String eventType,           // Event type (aggTrade)
    @JsonProperty("E") Long eventTime,             // Event time (ms)
    @JsonProperty("s") String symbol,              // Symbol (BTCUSDT)
    @JsonProperty("a") Long aggregateTradeId,      // Aggregate trade ID
    @JsonProperty("p") String price,               // Price
    @JsonProperty("q") String quantity,            // Quantity
    @JsonProperty("f") Long firstTradeId,          // First trade ID
    @JsonProperty("l") Long lastTradeId,           // Last trade ID
    @JsonProperty("T") Long tradeTime,             // Trade time (ms)
    @JsonProperty("m") Boolean isBuyerMaker,       // Is the buyer the market maker?
    @JsonProperty("M") Boolean ignore              // Ignore
) {}
