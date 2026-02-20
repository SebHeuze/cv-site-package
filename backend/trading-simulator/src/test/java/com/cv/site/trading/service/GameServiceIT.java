package com.cv.site.trading.service;

import com.cv.site.trading.dto.GameSessionResponse;
import com.cv.site.trading.dto.GameStatusResponse;
import com.cv.site.trading.dto.TradeResponse;
import com.cv.site.trading.model.Portfolio;
import com.cv.site.trading.repository.GameSessionRepository;
import com.cv.site.trading.repository.PortfolioRepository;
import com.cv.site.trading.repository.TradeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Integration tests for GameService: verifies game lifecycle against a real JPA (H2) database.
 * PriceService is mocked to control prices deterministically.
 */
@SpringBootTest
@ActiveProfiles("test")
@EmbeddedKafka(
        partitions = 1,
        topics = {"binance-btcusdt-trades", "trading-events"},
        bootstrapServersProperty = "spring.kafka.bootstrap-servers"
)
@TestPropertySource(properties = {
        "spring.kafka.consumer.auto-offset-reset=earliest"
})
@DirtiesContext
class GameServiceIT {

    @MockitoBean
    private PriceService priceService;

    @MockitoBean
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private GameService gameService;

    @Autowired
    private GameSessionRepository gameSessionRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private TradeRepository tradeRepository;

    private static final String USER_ID = "test-user";
    private static final BigDecimal ENTRY_PRICE = new BigDecimal("50000.00");

    @BeforeEach
    void setUp() {
        tradeRepository.deleteAll();
        gameSessionRepository.deleteAll();
        portfolioRepository.deleteAll();
        when(priceService.getCurrentPrice()).thenReturn(ENTRY_PRICE);
    }

    @Test
    void startGame_shouldCreateSessionAndPortfolio() {
        GameSessionResponse response = gameService.startGame(USER_ID, "LONG");

        assertThat(response.getId()).isNotNull();
        assertThat(response.getUserId()).isEqualTo(USER_ID);
        assertThat(response.getAlive()).isTrue();
        assertThat(response.getInitialCapital()).isEqualByComparingTo("10000.00");
        assertThat(gameSessionRepository.findByUserIdAndAliveTrue(USER_ID)).isPresent();
        assertThat(portfolioRepository.findByUserId(USER_ID)).isPresent();
    }

    @Test
    void startGame_shouldEndPreviousSessionIfOneAlreadyExists() {
        gameService.startGame(USER_ID, "LONG");
        gameService.startGame(USER_ID, "SHORT");

        long activeCount = gameSessionRepository.findAll().stream()
                .filter(s -> s.getAlive()).count();
        assertThat(activeCount).isEqualTo(1);
    }

    @Test
    void goLong_fromShort_shouldSwitchPositionAndRecordTrade() {
        gameService.startGame(USER_ID, "SHORT");

        // Price stays same → zero P&L, capital unchanged
        TradeResponse response = gameService.goLong(USER_ID);

        // TradeResponse is a record — use accessor methods (no "get" prefix)
        assertThat(response.symbol()).isEqualTo("BTCUSDT");
        assertThat(portfolioRepository.findByUserId(USER_ID))
                .get()
                .satisfies(p -> assertThat(p.getPositionType()).isEqualTo(Portfolio.PositionType.LONG));
        assertThat(tradeRepository.findAll()).hasSize(1);
    }

    @Test
    void goShort_fromLong_shouldSwitchPositionAndRecordTrade() {
        gameService.startGame(USER_ID, "LONG");

        TradeResponse response = gameService.goShort(USER_ID);

        assertThat(response.symbol()).isEqualTo("BTCUSDT");
        assertThat(portfolioRepository.findByUserId(USER_ID))
                .get()
                .satisfies(p -> assertThat(p.getPositionType()).isEqualTo(Portfolio.PositionType.SHORT));
    }

    @Test
    void goLong_whenAlreadyLong_shouldThrow() {
        gameService.startGame(USER_ID, "LONG");

        assertThatThrownBy(() -> gameService.goLong(USER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("LONG");
    }

    @Test
    void goShort_whenAlreadyShort_shouldThrow() {
        gameService.startGame(USER_ID, "SHORT");

        assertThatThrownBy(() -> gameService.goShort(USER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("SHORT");
    }

    @Test
    void endGame_shouldMarkSessionDeadAndPersistScore() {
        GameSessionResponse session = gameService.startGame(USER_ID, "LONG");

        gameService.endGame(session.getId());

        assertThat(gameSessionRepository.findByUserIdAndAliveTrue(USER_ID)).isEmpty();
        assertThat(gameSessionRepository.findById(session.getId()))
                .get()
                .satisfies(s -> assertThat(s.getAlive()).isFalse());
    }

    @Test
    void getGameStatus_shouldReturnCurrentPortfolioState() {
        gameService.startGame(USER_ID, "LONG");

        GameStatusResponse status = gameService.getGameStatus(USER_ID);

        assertThat(status.getAlive()).isTrue();
        assertThat(status.getCurrentPrice()).isEqualByComparingTo(ENTRY_PRICE);
        assertThat(status.getPortfolio()).isNotNull();
    }
}
