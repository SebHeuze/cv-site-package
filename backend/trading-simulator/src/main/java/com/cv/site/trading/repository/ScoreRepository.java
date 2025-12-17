package com.cv.site.trading.repository;

import com.cv.site.trading.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {

    @Query("SELECT s FROM Score s ORDER BY s.survivalTimeSeconds DESC, s.finalCapital DESC")
    List<Score> findTopScores(@Param("limit") int limit);

    List<Score> findTop10ByOrderBySurvivalTimeSecondsDescFinalCapitalDesc();
}
