package com.cv.site.trading.repository;

import com.cv.site.trading.model.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, String> {

    Optional<GameSession> findByUserIdAndAliveTrue(String userId);

    Optional<GameSession> findByIdAndAliveTrue(String id);
}
