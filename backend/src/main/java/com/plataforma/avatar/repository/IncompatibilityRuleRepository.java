package com.plataforma.avatar.repository;

import com.plataforma.avatar.model.IncompatibilityRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncompatibilityRuleRepository extends JpaRepository<IncompatibilityRule, Long> {

    /**
     * Verifica si existe una regla para un par canónico (assetA.id, assetB.id)
     */
    boolean existsByAssetAIdAndAssetBId(Long assetAId, Long assetBId);

    /**
     * Busca la regla de un par canónico específico
     */
    Optional<IncompatibilityRule> findByAssetAIdAndAssetBId(Long assetAId, Long assetBId);

    /**
     * Busca todas las reglas que involucran a un activo determinado
     */
    @Query("SELECT r FROM IncompatibilityRule r " +
           "JOIN FETCH r.assetA a1 JOIN FETCH a1.category " +
           "JOIN FETCH r.assetB a2 JOIN FETCH a2.category " +
           "WHERE r.assetA.id = :assetId OR r.assetB.id = :assetId")
    List<IncompatibilityRule> findByAssetId(@Param("assetId") Long assetId);

    /**
     * Detecta colisiones cruzadas entre un conjunto de activos equipados (HU-09 / CA-03)
     */
    @Query("SELECT r FROM IncompatibilityRule r " +
           "JOIN FETCH r.assetA a1 JOIN FETCH a1.category " +
           "JOIN FETCH r.assetB a2 JOIN FETCH a2.category " +
           "WHERE r.assetA.id IN :assetIds AND r.assetB.id IN :assetIds")
    List<IncompatibilityRule> findIncompatibilitiesAmongAssets(@Param("assetIds") List<Long> assetIds);

    /**
     * Listado con carga optimizada (JOIN FETCH) para el Backoffice
     */
    @Query(value = "SELECT r FROM IncompatibilityRule r " +
                   "JOIN FETCH r.assetA a1 JOIN FETCH a1.category " +
                   "JOIN FETCH r.assetB a2 JOIN FETCH a2.category " +
                   "ORDER BY r.createdAt DESC",
           countQuery = "SELECT count(r) FROM IncompatibilityRule r")
    Page<IncompatibilityRule> findAllWithDetails(Pageable pageable);

    @Query("SELECT r FROM IncompatibilityRule r " +
           "JOIN FETCH r.assetA a1 JOIN FETCH a1.category " +
           "JOIN FETCH r.assetB a2 JOIN FETCH a2.category " +
           "ORDER BY r.createdAt DESC")
    List<IncompatibilityRule> findAllWithDetails();
}
