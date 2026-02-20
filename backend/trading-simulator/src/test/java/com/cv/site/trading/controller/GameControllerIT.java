package com.cv.site.trading.controller;

import com.cv.site.trading.dto.CandlestickDto;
import com.cv.site.trading.dto.GameSessionResponse;
import com.cv.site.trading.dto.GameStatusResponse;
import com.cv.site.trading.dto.PortfolioResponse;
import com.cv.site.trading.dto.ScoreResponse;
import com.cv.site.trading.dto.TradeResponse;
import com.cv.site.trading.service.GameService;
import com.cv.site.trading.service.PriceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REST API tests for GameController. Uses the full Spring MVC context loaded via
 * @SpringBootTest so that routing, validation, and serialization are all exercised.
 * Services are mocked so no real DB/Kafka I/O happens during assertions.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@EmbeddedKafka(
        partitions = 1,
        topics = {"binance-btcusdt-trades", "trading-events"},
        bootstrapServersProperty = "spring.kafka.bootstrap-servers"
)
@DirtiesContext
class GameControllerIT {

    @Autowired
    private WebApplicationContext wac;

    @MockitoBean
    private GameService gameService;

    @MockitoBean
    private PriceService priceService;

    @MockitoBean
    private SimpMessagingTemplate messagingTemplate;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
    }

    // ── /api/game/start ────────────────────────────────────────────────────────

    @Test
    void startGame_shouldReturn200WithSession() throws Exception {
        GameSessionResponse session = GameSessionResponse.builder()
                .id("session-1").userId("alice").alive(true)
                .initialCapital(new BigDecimal("10000.00")).tradeCount(0)
                .startTime(Instant.now()).build();
        when(gameService.startGame("alice", "LONG")).thenReturn(session);

        mockMvc.perform(post("/api/game/start")
                        .param("userId", "alice")
                        .param("initialPosition", "LONG"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("session-1"))
                .andExpect(jsonPath("$.userId").value("alice"))
                .andExpect(jsonPath("$.alive").value(true));
    }

    // ── /api/game/long ─────────────────────────────────────────────────────────

    @Test
    void goLong_shouldReturn200WithTrade() throws Exception {
        TradeResponse trade = new TradeResponse(
                1L, "BUY", "BTCUSDT", new BigDecimal("50000"), new BigDecimal("0.2"),
                BigDecimal.ZERO, new BigDecimal("10000"), Instant.now(), "Trade executed successfully");
        when(gameService.goLong("alice")).thenReturn(trade);

        mockMvc.perform(post("/api/game/long").param("userId", "alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("BTCUSDT"))
                .andExpect(jsonPath("$.type").value("BUY"));
    }

    @Test
    void goLong_whenIllegalState_shouldReturn400() throws Exception {
        when(gameService.goLong(anyString())).thenThrow(new IllegalStateException("Already in LONG position"));

        mockMvc.perform(post("/api/game/long").param("userId", "alice"))
                .andExpect(status().isBadRequest());
    }

    // ── /api/game/short ────────────────────────────────────────────────────────

    @Test
    void goShort_shouldReturn200WithTrade() throws Exception {
        TradeResponse trade = new TradeResponse(
                2L, "SELL", "BTCUSDT", new BigDecimal("50000"), new BigDecimal("0.2"),
                BigDecimal.ZERO, new BigDecimal("10000"), Instant.now(), "Trade executed successfully");
        when(gameService.goShort("alice")).thenReturn(trade);

        mockMvc.perform(post("/api/game/short").param("userId", "alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("BTCUSDT"))
                .andExpect(jsonPath("$.type").value("SELL"));
    }

    // ── /api/game/status ───────────────────────────────────────────────────────

    @Test
    void getStatus_shouldReturn200WithCurrentState() throws Exception {
        GameStatusResponse statusResponse = GameStatusResponse.builder()
                .session(GameSessionResponse.builder().id("s1").userId("alice").alive(true).build())
                .portfolio(new PortfolioResponse(
                        "alice", new BigDecimal("10000"), BigDecimal.ZERO, BigDecimal.ZERO,
                        new BigDecimal("50000"), "LONG", new BigDecimal("50000"),
                        new BigDecimal("10000"), new BigDecimal("10000"), Instant.now()))
                .currentPrice(new BigDecimal("50000")).alive(true).build();
        when(gameService.getGameStatus("alice")).thenReturn(statusResponse);

        mockMvc.perform(get("/api/game/status").param("userId", "alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alive").value(true))
                .andExpect(jsonPath("$.currentPrice").value(50000));
    }

    @Test
    void getStatus_noActiveGame_shouldReturn404() throws Exception {
        when(gameService.getGameStatus(anyString())).thenThrow(new IllegalStateException("No active game"));

        mockMvc.perform(get("/api/game/status").param("userId", "alice"))
                .andExpect(status().isNotFound());
    }

    // ── /api/game/end ──────────────────────────────────────────────────────────

    @Test
    void endGame_shouldReturn200WithScore() throws Exception {
        ScoreResponse score = ScoreResponse.builder()
                .id(1L).userId("alice").username("alice")
                .survivalTimeSeconds(120L).finalCapital(new BigDecimal("12000"))
                .tradeCount(5).achievedAt(Instant.now()).build();
        when(gameService.endGame("session-1")).thenReturn(score);

        mockMvc.perform(post("/api/game/end").param("sessionId", "session-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("alice"))
                .andExpect(jsonPath("$.survivalTimeSeconds").value(120));
    }

    // ── /api/price/history ─────────────────────────────────────────────────────

    @Test
    void getPriceHistory_shouldReturn200WithCandlesticks() throws Exception {
        List<CandlestickDto> history = List.of(new CandlestickDto(
                1700000000L, new BigDecimal("49000"), new BigDecimal("51000"),
                new BigDecimal("48000"), new BigDecimal("50000")));
        when(priceService.getPriceHistory()).thenReturn(history);

        mockMvc.perform(get("/api/price/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].close").value(50000));
    }
}
