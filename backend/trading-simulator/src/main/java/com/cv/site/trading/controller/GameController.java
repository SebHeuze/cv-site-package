package com.cv.site.trading.controller;

import com.cv.site.trading.dto.CandlestickDto;
import com.cv.site.trading.dto.GameSessionResponse;
import com.cv.site.trading.dto.GameStatusResponse;
import com.cv.site.trading.dto.PortfolioResponse;
import com.cv.site.trading.dto.ScoreResponse;
import com.cv.site.trading.dto.TradeResponse;
import com.cv.site.trading.service.GameService;
import com.cv.site.trading.service.PriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final PriceService priceService;

    /**
     * Start a new game for a user
     * POST /api/game/start?userId=username&initialPosition=LONG
     */
    @PostMapping("/game/start")
    public ResponseEntity<GameSessionResponse> startGame(
            @RequestParam String userId,
            @RequestParam(defaultValue = "LONG") String initialPosition) {
        log.info("Starting new game for user: {} with initial position: {}", userId, initialPosition);
        GameSessionResponse response = gameService.startGame(userId, initialPosition);
        return ResponseEntity.ok(response);
    }

    /**
     * Execute LONG trade (buy all-in with USDT)
     * POST /api/game/long?userId=username
     */
    @PostMapping("/game/long")
    public ResponseEntity<TradeResponse> goLong(@RequestParam String userId) {
        log.info("User {} executing LONG trade", userId);
        try {
            TradeResponse response = gameService.goLong(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.error("Error executing LONG trade for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Execute SHORT trade (sell all BTC)
     * POST /api/game/short?userId=username
     */
    @PostMapping("/game/short")
    public ResponseEntity<TradeResponse> goShort(@RequestParam String userId) {
        log.info("User {} executing SHORT trade", userId);
        try {
            TradeResponse response = gameService.goShort(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.error("Error executing SHORT trade for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get current game status
     * GET /api/game/status?userId=username
     */
    @GetMapping("/game/status")
    public ResponseEntity<GameStatusResponse> getStatus(@RequestParam String userId) {
        log.debug("Getting game status for user: {}", userId);
        try {
            GameStatusResponse response = gameService.getGameStatus(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.error("Error getting game status for user {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * End the current game
     * POST /api/game/end?sessionId=session-uuid
     */
    @PostMapping("/game/end")
    public ResponseEntity<ScoreResponse> endGame(@RequestParam String sessionId) {
        log.info("Ending game session: {}", sessionId);
        try {
            ScoreResponse response = gameService.endGame(sessionId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error ending game session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get price history for chart initialization
     * GET /api/price/history
     */
    @GetMapping("/price/history")
    public ResponseEntity<List<CandlestickDto>> getPriceHistory() {
        log.debug("Getting price history for chart initialization");
        List<CandlestickDto> history = priceService.getPriceHistory();
        return ResponseEntity.ok(history);
    }
}
