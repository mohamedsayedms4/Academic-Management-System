package org.example.academicmanagementsystem.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.RoundRequest;
import org.example.academicmanagementsystem.dto.RoundResponse;
import org.example.academicmanagementsystem.mapper.RoundMapper;
import org.example.academicmanagementsystem.model.Round;
import org.example.academicmanagementsystem.model.RoundDiploma;
import org.example.academicmanagementsystem.model.RoundStatus;
import org.example.academicmanagementsystem.repository.DiplomaRepository;
import org.example.academicmanagementsystem.repository.RoundRepository;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.example.academicmanagementsystem.service.RoundService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoundServiceImpl implements RoundService {

    private final RoundRepository roundRepository;
    private final RoundMapper roundMapper;
    private final DiplomaRepository diplomaRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public RoundResponse save(RoundRequest roundRequest) {
        if (Objects.isNull(roundRequest)) {
            throw new IllegalArgumentException("RoundRequest is null");
        }

        Round round = roundMapper.toRoundEntity(roundRequest);

        // Handle Diplomas
        if (roundRequest.getDiplomas() != null) {
            List<RoundDiploma> roundDiplomas = roundRequest.getDiplomas().stream().map(req -> {
                RoundDiploma rd = roundMapper.toRoundDiplomaEntity(req);
                rd.setRound(round);
                rd.setDiploma(diplomaRepository.findById(req.getDiplomaId())
                        .orElseThrow(() -> new RuntimeException("Diploma not found with id: " + req.getDiplomaId())));
                
                if (req.getInstructorId() != null) {
                    rd.setInstructor(userRepository.findById(req.getInstructorId())
                            .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + req.getInstructorId())));
                }
                
                return rd;
            }).collect(Collectors.toList());
            round.setRoundDiplomas(roundDiplomas);
        }

        // Set default status if not provided
        if (round.getStatus() == null) {
            round.setStatus(RoundStatus.ACTIVE);
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
                    // Update basic fields
                    if (roundRequest.getName() != null) {
                        existingRound.setName(roundRequest.getName());
                    }
                    if (roundRequest.getStartDate() != null) {
                        existingRound.setStartDate(roundRequest.getStartDate());
                    }
                    if (roundRequest.getEndDate() != null) {
                        existingRound.setEndDate(roundRequest.getEndDate());
                    }
                    if (roundRequest.getStatus() != null) {
                        existingRound.setStatus(roundRequest.getStatus());
                    }

                    // Update Diplomas (simplistic approach: clear and re-add)
                    if (roundRequest.getDiplomas() != null) {
                        existingRound.getRoundDiplomas().clear();
                        List<RoundDiploma> newDiplomas = roundRequest.getDiplomas().stream().map(req -> {
                            RoundDiploma rd = roundMapper.toRoundDiplomaEntity(req);
                            rd.setRound(existingRound);
                            rd.setDiploma(diplomaRepository.findById(req.getDiplomaId())
                                    .orElseThrow(() -> new RuntimeException("Diploma not found with id: " + req.getDiplomaId())));
                            
                            if (req.getInstructorId() != null) {
                                rd.setInstructor(userRepository.findById(req.getInstructorId())
                                        .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + req.getInstructorId())));
                            }
                            
                            return rd;
                        }).collect(Collectors.toList());
                        existingRound.getRoundDiplomas().addAll(newDiplomas);
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
