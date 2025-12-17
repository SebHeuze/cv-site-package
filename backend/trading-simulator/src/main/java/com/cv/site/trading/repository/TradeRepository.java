package com.cv.site.trading.repository;

import com.cv.site.trading.model.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {

    List<Trade> findByUserIdOrderByTimestampDesc(String userId);

    @Query("SELECT COUNT(t) FROM Trade t WHERE t.userId = :userId AND t.type = 'BUY'")
    long countBuysByUserId(String userId);

    @Query("SELECT COUNT(t) FROM Trade t WHERE t.userId = :userId AND t.type = 'SELL'")
    long countSellsByUserId(String userId);
}
