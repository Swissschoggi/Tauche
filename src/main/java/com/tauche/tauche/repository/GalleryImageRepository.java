package com.tauche.tauche.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tauche.tauche.model.GalleryImage;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {
    List<GalleryImage> findByDiveLogIdOrderByCreatedAtAsc(Long diveLogId);
    void deleteByDiveLogId(Long diveLogId);

    long count();
}