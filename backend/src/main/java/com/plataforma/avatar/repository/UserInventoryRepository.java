package com.plataforma.avatar.repository;

import com.plataforma.avatar.model.UserInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInventoryRepository extends JpaRepository<UserInventory, Long> {

    List<UserInventory> findByUserId(Long userId);

    boolean existsByUserIdAndAssetId(Long userId, Long assetId);

    @Query("SELECT ui.asset.id FROM UserInventory ui WHERE ui.userId = :userId")
    List<Long> findUnlockedAssetIdsByUserId(@Param("userId") Long userId);
}
