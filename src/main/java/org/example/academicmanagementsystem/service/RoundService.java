package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.RoundRequest;
import org.example.academicmanagementsystem.dto.RoundResponse;
import org.example.academicmanagementsystem.model.RoundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface RoundService {

    RoundResponse save(RoundRequest roundRequest);

    Optional<RoundResponse> findById(Long id);

    Page<RoundResponse> findAll(Pageable pageable);

    Optional<RoundResponse> update(Long id, RoundRequest roundRequest);

    Boolean deleteById(Long id);

    Page<RoundResponse> getRoundsByStatus(Pageable pageable, RoundStatus status);

    Integer count();

    Integer countByStatus(RoundStatus status);
}
