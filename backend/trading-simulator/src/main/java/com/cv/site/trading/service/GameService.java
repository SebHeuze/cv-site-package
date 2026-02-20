package com.cv.site.trading.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.cv.site.trading.dto.GameSessionResponse;
import com.cv.site.trading.dto.GameStatusResponse;
import com.cv.site.trading.dto.PortfolioResponse;
import com.cv.site.trading.dto.ScoreResponse;
import com.cv.site.trading.dto.TradeResponse;
import com.cv.site.trading.model.GameSession;
import com.cv.site.trading.model.Portfolio;
import com.cv.site.trading.model.Score;
import com.cv.site.trading.model.Trade;
import com.cv.site.trading.repository.GameSessionRepository;
import com.cv.site.trading.repository.PortfolioRepository;
import com.cv.site.trading.repository.ScoreRepository;
import com.cv.site.trading.repository.TradeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private static final BigDecimal INITIAL_CAPITAL = new BigDecimal("10000.00");
    private static final BigDecimal FEE_RATE = BigDecimal.ZERO; // 0% fee
    private static final BigDecimal ONE_MINUS_FEE = BigDecimal.ONE.subtract(FEE_RATE);
    private static final BigDecimal LEVERAGE = new BigDecimal("1000"); // 1000x leverage

    private final GameSessionRepository gameSessionRepository;
    private final PortfolioRepository portfolioRepository;
    private final TradeRepository tradeRepository;
    private final ScoreRepository scoreRepository;
    private final PriceService priceService;

    // Self-reference via proxy to ensure @Transactional(REQUIRES_NEW) is honoured
    // when endGame() is called internally from startGame(), goLong(), goShort()
    @Autowired @Lazy
    private GameService self;

    @Transactional
    public GameSessionResponse startGame(String userId, String initialPosition) {
        // Check if user already has an active game
        gameSessionRepository.findByUserIdAndAliveTrue(userId)
                .ifPresent(session -> {
                    log.warn("User {} already has an active game, ending it first", userId);
                    self.endGame(session.getId());
                });

        BigDecimal currentPrice = priceService.getCurrentPrice();

        // Parse initial position
        Portfolio.PositionType positionType;
        try {
            positionType = Portfolio.PositionType.valueOf(initialPosition.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid initial position '{}', defaulting to LONG", initialPosition);
            positionType = Portfolio.PositionType.LONG;
        }

        // Create new portfolio with initial capital
        Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElse(Portfolio.builder()
                        .userId(userId)
                        .capitalUSDT(INITIAL_CAPITAL)
                        .positionType(positionType)
                        .entryPrice(currentPrice)
                        .positionSize(INITIAL_CAPITAL)
                        .lastUpdated(Instant.now())
                        .build());

        portfolio.setCapitalUSDT(INITIAL_CAPITAL);
        portfolio.setPositionType(positionType);
        portfolio.setEntryPrice(currentPrice);
        portfolio.setPositionSize(INITIAL_CAPITAL);
        portfolio.setLastUpdated(Instant.now());
        portfolioRepository.save(portfolio);

        // Create new game session
        GameSession session = GameSession.builder()
                .userId(userId)
                .startTime(Instant.now())
                .initialCapital(INITIAL_CAPITAL)
                .alive(true)
                .tradeCount(0)
                .build();

        session = gameSessionRepository.save(session);
        log.info("Started new game for user {} with {} position at price {}", userId, positionType, currentPrice);

        return toGameSessionResponse(session);
    }

    @Transactional
    public TradeResponse goLong(String userId) {
        GameSession session = getActiveSession(userId);
        Portfolio portfolio = getPortfolio(userId);
        BigDecimal currentPrice = priceService.getCurrentPrice();

        // If already LONG, do nothing
        if (portfolio.getPositionType() == Portfolio.PositionType.LONG) {
            log.warn("User {} is already in LONG position", userId);
            throw new IllegalStateException("Already in LONG position");
        }

        // Close SHORT position and calculate P&L with leverage
        // For SHORT: P&L = (entryPrice - currentPrice) / entryPrice * positionSize * leverage
        BigDecimal priceDiff = portfolio.getEntryPrice().subtract(currentPrice);
        BigDecimal priceChangePercent = priceDiff.divide(portfolio.getEntryPrice(), 8, RoundingMode.HALF_UP);
        BigDecimal pnl = priceChangePercent.multiply(portfolio.getPositionSize()).multiply(LEVERAGE);
        BigDecimal newCapital = portfolio.getCapitalUSDT().add(pnl);

        // Check if game over (capital <= 0)
        if (newCapital.compareTo(BigDecimal.ZERO) <= 0) {
            portfolio.setCapitalUSDT(BigDecimal.ZERO);
            portfolio.setLastUpdated(Instant.now());
            portfolioRepository.save(portfolio);
            endGame(session.getId());
            throw new IllegalStateException("Game Over: Capital depleted");
        }

        // Open LONG position
        portfolio.setCapitalUSDT(newCapital);
        portfolio.setPositionType(Portfolio.PositionType.LONG);
        portfolio.setEntryPrice(currentPrice);
        portfolio.setPositionSize(newCapital);
        portfolio.setLastUpdated(Instant.now());
        portfolioRepository.save(portfolio);

        // Record trade
        Trade trade = Trade.builder()
                .userId(userId)
                .type(Trade.TradeType.BUY)
                .symbol("BTCUSDT")
                .price(currentPrice)
                .quantity(newCapital.divide(currentPrice, 8, RoundingMode.DOWN))
                .fee(BigDecimal.ZERO)
                .totalAmount(newCapital)
                .timestamp(Instant.now())
                .build();
        tradeRepository.save(trade);

        // Increment trade count
        session.incrementTradeCount();
        gameSessionRepository.save(session);

        log.info("User {} switched to LONG at {} USDT, P&L: {}, New Capital: {}", userId, currentPrice, pnl, newCapital);

        return toTradeResponse(trade);
    }

    @Transactional
    public TradeResponse goShort(String userId) {
        GameSession session = getActiveSession(userId);
        Portfolio portfolio = getPortfolio(userId);
        BigDecimal currentPrice = priceService.getCurrentPrice();

        // If already SHORT, do nothing
        if (portfolio.getPositionType() == Portfolio.PositionType.SHORT) {
            log.warn("User {} is already in SHORT position", userId);
            throw new IllegalStateException("Already in SHORT position");
        }

        // Close LONG position and calculate P&L with leverage
        // For LONG: P&L = (currentPrice - entryPrice) / entryPrice * positionSize * leverage
        BigDecimal priceDiff = currentPrice.subtract(portfolio.getEntryPrice());
        BigDecimal priceChangePercent = priceDiff.divide(portfolio.getEntryPrice(), 8, RoundingMode.HALF_UP);
        BigDecimal pnl = priceChangePercent.multiply(portfolio.getPositionSize()).multiply(LEVERAGE);
        BigDecimal newCapital = portfolio.getCapitalUSDT().add(pnl);

        // Check if game over (capital <= 0)
        if (newCapital.compareTo(BigDecimal.ZERO) <= 0) {
            portfolio.setCapitalUSDT(BigDecimal.ZERO);
            portfolio.setLastUpdated(Instant.now());
            portfolioRepository.save(portfolio);
            endGame(session.getId());
            throw new IllegalStateException("Game Over: Capital depleted");
        }

        // Open SHORT position
        portfolio.setCapitalUSDT(newCapital);
        portfolio.setPositionType(Portfolio.PositionType.SHORT);
        portfolio.setEntryPrice(currentPrice);
        portfolio.setPositionSize(newCapital);
        portfolio.setLastUpdated(Instant.now());
        portfolioRepository.save(portfolio);

        // Record trade
        Trade trade = Trade.builder()
                .userId(userId)
                .type(Trade.TradeType.SELL)
                .symbol("BTCUSDT")
                .price(currentPrice)
                .quantity(newCapital.divide(currentPrice, 8, RoundingMode.DOWN))
                .fee(BigDecimal.ZERO)
                .totalAmount(newCapital)
                .timestamp(Instant.now())
                .build();
        tradeRepository.save(trade);

        // Increment trade count
        session.incrementTradeCount();
        gameSessionRepository.save(session);

        log.info("User {} switched to SHORT at {} USDT, P&L: {}, New Capital: {}", userId, currentPrice, pnl, newCapital);

        return toTradeResponse(trade);
    }

    @Transactional
    public GameStatusResponse getGameStatus(String userId) {
        GameSession session = getActiveSession(userId);
        Portfolio portfolio = getPortfolio(userId);
        BigDecimal currentPrice = priceService.getCurrentPrice();

        // Calculate current capital based on position
        BigDecimal currentCapital = calculateCurrentCapital(portfolio, currentPrice);

        boolean alive = currentCapital.compareTo(BigDecimal.ZERO) > 0 && session.getAlive();

        if (!alive && session.getAlive()) {
            // Game over condition detected - capital depleted
            log.warn("Game over detected for user {} - Total value: {}", userId, currentCapital);
            portfolio.setCapitalUSDT(BigDecimal.ZERO);
            portfolioRepository.save(portfolio);
            endGame(session.getId());
            // Refresh session to get updated state
            session = gameSessionRepository.findById(session.getId())
                    .orElseThrow(() -> new IllegalStateException("Session not found"));
        }

        return GameStatusResponse.builder()
                .session(toGameSessionResponse(session))
                .portfolio(toPortfolioResponse(portfolio, currentPrice))
                .currentPrice(currentPrice)
                .alive(alive)
                .build();
    }

    private BigDecimal calculateCurrentCapital(Portfolio portfolio, BigDecimal currentPrice) {
        if (portfolio.getEntryPrice().signum() == 0) {
            return portfolio.getCapitalUSDT();
        }
        BigDecimal priceDiff;
        BigDecimal priceChangePercent;
        BigDecimal pnl;

        if (portfolio.getPositionType() == Portfolio.PositionType.LONG) {
            // For LONG: P&L = (currentPrice - entryPrice) / entryPrice * positionSize * leverage
            priceDiff = currentPrice.subtract(portfolio.getEntryPrice());
            priceChangePercent = priceDiff.divide(portfolio.getEntryPrice(), 8, RoundingMode.HALF_UP);
            pnl = priceChangePercent.multiply(portfolio.getPositionSize()).multiply(LEVERAGE);
        } else {
            // For SHORT: P&L = (entryPrice - currentPrice) / entryPrice * positionSize * leverage
            priceDiff = portfolio.getEntryPrice().subtract(currentPrice);
            priceChangePercent = priceDiff.divide(portfolio.getEntryPrice(), 8, RoundingMode.HALF_UP);
            pnl = priceChangePercent.multiply(portfolio.getPositionSize()).multiply(LEVERAGE);
        }

        return portfolio.getCapitalUSDT().add(pnl);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ScoreResponse endGame(String sessionId) {
        GameSession session = gameSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Game session not found"));

        if (!session.getAlive()) {
            log.warn("Game session {} already ended, skipping", sessionId);
            return null;
        }

        Portfolio portfolio = getPortfolio(session.getUserId());
        BigDecimal currentPrice = priceService.getCurrentPrice();
        BigDecimal finalCapital = calculateCurrentCapital(portfolio, currentPrice);

        session.endGame(finalCapital);
        gameSessionRepository.save(session);

        // Save score
        Score score = Score.builder()
                .userId(session.getUserId())
                .username(session.getUserId()) // For now, userId = username
                .survivalTimeSeconds(session.getSurvivalTimeSeconds())
                .finalCapital(finalCapital)
                .tradeCount(session.getTradeCount())
                .achievedAt(Instant.now())
                .build();

        score = scoreRepository.save(score);

        log.info("Game ended for user {}: survived {} seconds, final capital {} USDT",
                session.getUserId(), session.getSurvivalTimeSeconds(), finalCapital);

        return toScoreResponse(score);
    }

    private GameSession getActiveSession(String userId) {
        return gameSessionRepository.findByUserIdAndAliveTrue(userId)
                .orElseThrow(() -> new IllegalStateException("No active game session for user"));
    }

    private Portfolio getPortfolio(String userId) {
        return portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Portfolio not found for user"));
    }

    public PortfolioResponse getPortfolioResponse(String userId) {
        Portfolio portfolio = getPortfolio(userId);
        BigDecimal currentPrice = priceService.getCurrentPrice();
        return toPortfolioResponse(portfolio, currentPrice);
    }

    private GameSessionResponse toGameSessionResponse(GameSession session) {
        return GameSessionResponse.builder()
                .id(session.getId())
                .userId(session.getUserId())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .initialCapital(session.getInitialCapital())
                .finalCapital(session.getFinalCapital())
                .alive(session.getAlive())
                .tradeCount(session.getTradeCount())
                .survivalTimeSeconds(session.getSurvivalTimeSeconds())
                .build();
    }

    private PortfolioResponse toPortfolioResponse(Portfolio portfolio, BigDecimal currentPrice) {
        return PortfolioResponse.fromPortfolio(portfolio, currentPrice);
    }

    private TradeResponse toTradeResponse(Trade trade) {
        return TradeResponse.fromTrade(trade, "Trade executed successfully");
    }

    private ScoreResponse toScoreResponse(Score score) {
        return ScoreResponse.builder()
                .id(score.getId())
                .userId(score.getUserId())
                .username(score.getUsername())
                .survivalTimeSeconds(score.getSurvivalTimeSeconds())
                .finalCapital(score.getFinalCapital())
                .achievedAt(score.getAchievedAt())
                .tradeCount(score.getTradeCount())
                .build();
    }
}
