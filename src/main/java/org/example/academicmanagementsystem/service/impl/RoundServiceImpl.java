package org.example.academicmanagementsystem.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.RoundRequest;
import org.example.academicmanagementsystem.dto.RoundResponse;
import org.example.academicmanagementsystem.mapper.RoundMapper;
import org.example.academicmanagementsystem.model.Round;
import org.example.academicmanagementsystem.model.RoundStatus;
import org.example.academicmanagementsystem.repository.RoundRepository;
import org.example.academicmanagementsystem.service.RoundService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoundServiceImpl implements RoundService {

    private final RoundRepository roundRepository;
    private final RoundMapper roundMapper;

    @Override
    @Transactional
    public RoundResponse save(RoundRequest roundRequest) {
        if (Objects.isNull(roundRequest)) {
            throw new IllegalArgumentException("RoundRequest is null");
        }

        Round round = roundMapper.toRoundEntity(roundRequest);

        // Set default status if not provided
        if (round.getStatus() == null) {
            round.setStatus(RoundStatus.ACTIVE);
        }

        // Set default currentEnrollment if not provided
        if (round.getCurrentEnrollment() == null) {
            round.setCurrentEnrollment(0);
        }

        Round savedRound = roundRepository.save(round);
        return roundMapper.toRoundResponse(savedRound);
    }

    @Override
    public Optional<RoundResponse> findById(Long id) {
        if (Objects.isNull(id)) {
            throw new IllegalArgumentException("ID is null");
        }

        return roundRepository.findById(id)
                .map(roundMapper::toRoundResponse);
    }

    @Override
    public Page<RoundResponse> findAll(Pageable pageable) {
        if (Objects.isNull(pageable)) {
            throw new IllegalArgumentException("Pageable is null");
        }

        return roundRepository.findAll(pageable)
                .map(roundMapper::toRoundResponse);
    }

    @Override
    @Transactional
    public Optional<RoundResponse> update(Long id, RoundRequest roundRequest) {
        if (Objects.isNull(id) || Objects.isNull(roundRequest)) {
            throw new IllegalArgumentException("ID or RoundRequest is null");
        }

        return roundRepository.findById(id)
                .map(existingRound -> {
                    // Update fields
                    if (roundRequest.getName() != null) {
                        existingRound.setName(roundRequest.getName());
                    }
                    if (roundRequest.getStartDate() != null) {
                        existingRound.setStartDate(roundRequest.getStartDate());
                    }
                    if (roundRequest.getEndDate() != null) {
                        existingRound.setEndDate(roundRequest.getEndDate());
                    }
                    if (roundRequest.getDiplomaName() != null) {
                        existingRound.setDiplomaName(roundRequest.getDiplomaName());
                    }
                    if (roundRequest.getTotalStudents() != null) {
                        existingRound.setTotalStudents(roundRequest.getTotalStudents());
                    }
                    if (roundRequest.getCurrentEnrollment() != null) {
                        existingRound.setCurrentEnrollment(roundRequest.getCurrentEnrollment());
                    }
                    if (roundRequest.getInstallmentAmount() != null) {
                        existingRound.setInstallmentAmount(roundRequest.getInstallmentAmount());
                    }
                    if (roundRequest.getStatus() != null) {
                        existingRound.setStatus(roundRequest.getStatus());
                    }

                    Round updatedRound = roundRepository.save(existingRound);
                    return roundMapper.toRoundResponse(updatedRound);
                });
    }

    @Override
    @Transactional
    public Boolean deleteById(Long id) {
        if (Objects.isNull(id)) {
            throw new IllegalArgumentException("ID is null");
        }

        if (!roundRepository.existsById(id)) {
            return false;
        }

        roundRepository.deleteById(id);
        return true;
    }

    @Override
    public Page<RoundResponse> getRoundsByStatus(Pageable pageable, RoundStatus status) {
        if (Objects.isNull(pageable) || Objects.isNull(status)) {
            throw new IllegalArgumentException("Pageable or RoundStatus is null");
        }

        return roundRepository.findRoundsByStatus(status, pageable)
                .map(roundMapper::toRoundResponse);
    }

    @Override
    public Integer count() {
        return (int) roundRepository.count();
    }

    @Override
    public Integer countByStatus(RoundStatus status) {
        if (Objects.isNull(status)) {
            throw new IllegalArgumentException("RoundStatus is null");
        }

        return roundRepository.findByStatus(status).size();
    }
}
