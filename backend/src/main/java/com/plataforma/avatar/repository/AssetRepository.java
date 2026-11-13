package com.plataforma.avatar.repository;

import com.plataforma.avatar.model.Asset;
import com.plataforma.avatar.model.AssetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Page<Asset> findByCategoryIdAndStatus(Long categoryId, AssetStatus status, Pageable pageable);

    Page<Asset> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Asset> findByStatus(AssetStatus status, Pageable pageable);

    List<Asset> findByCategoryIdAndStatus(Long categoryId, AssetStatus status);

    Optional<Asset> findByCategoryIdAndIsDefaultTrue(Long categoryId);

    @Query("SELECT a FROM Asset a WHERE " +
           "(:categoryId IS NULL OR a.category.id = :categoryId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:query IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Asset> searchAssets(
            @Param("categoryId") Long categoryId,
            @Param("status") AssetStatus status,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT a FROM Asset a JOIN FETCH a.category c WHERE a.status = :status ORDER BY a.isDefault DESC, a.name ASC")
    List<Asset> findAllByStatusWithCategory(@Param("status") AssetStatus status);

    @Query("SELECT a FROM Asset a JOIN FETCH a.category c WHERE a.status = :status AND c.id = :categoryId ORDER BY a.isDefault DESC, a.name ASC")
    List<Asset> findByCategoryIdAndStatusWithCategory(@Param("categoryId") Long categoryId, @Param("status") AssetStatus status);

    @Query("SELECT a FROM Asset a JOIN FETCH a.category c WHERE a.status = :status AND c.code = :categoryCode ORDER BY a.isDefault DESC, a.name ASC")
    List<Asset> findByCategoryCodeAndStatusWithCategory(@Param("categoryCode") String categoryCode, @Param("status") AssetStatus status);
}

