package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.DiplomaResponseV2;
import org.example.academicmanagementsystem.dto.RoundRequestV2;
import org.example.academicmanagementsystem.dto.RoundResponseV2;
import org.example.academicmanagementsystem.model.DiplomaV2;
import org.example.academicmanagementsystem.model.RoundV2;
import org.example.academicmanagementsystem.repository.DiplomaV2Repository;
import org.example.academicmanagementsystem.repository.RoundV2Repository;
import org.example.academicmanagementsystem.service.RoundV2Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoundV2ServiceImpl implements RoundV2Service {

    private final RoundV2Repository roundRepository;
    private final DiplomaV2Repository diplomaRepository;

    @Override
    @Transactional
    public RoundResponseV2 createRound(RoundRequestV2 request) {
        RoundV2 round = new RoundV2();
        round.setName(request.getName());
        round.setStartDate(request.getStartDate());
        round.setEndDate(request.getEndDate());
        
        if (request.getDiplomaIds() != null && !request.getDiplomaIds().isEmpty()) {
            List<DiplomaV2> diplomas = diplomaRepository.findAllById(request.getDiplomaIds());
            round.setDiplomas(new HashSet<>(diplomas));
        }

        RoundV2 savedRound = roundRepository.save(round);
        return mapToResponse(savedRound);
    }

    @Override
    @Transactional
    public RoundResponseV2 updateRound(Long id, RoundRequestV2 request) {
        RoundV2 round = roundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Round not found"));

        round.setName(request.getName());
        round.setStartDate(request.getStartDate());
        round.setEndDate(request.getEndDate());

        if (request.getDiplomaIds() != null) {
            List<DiplomaV2> diplomas = diplomaRepository.findAllById(request.getDiplomaIds());
            round.setDiplomas(new HashSet<>(diplomas));
        }

        RoundV2 updatedRound = roundRepository.save(round);
        return mapToResponse(updatedRound);
    }

    @Override
    @Transactional(readOnly = true)
    public RoundResponseV2 getRound(Long id) {
        RoundV2 round = roundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Round not found"));
        return mapToResponse(round);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoundResponseV2> getAllRounds(Pageable pageable) {
        return roundRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoundResponseV2> getAllRoundsList() {
        return roundRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteRound(Long id) {
        roundRepository.deleteById(id);
    }

    private RoundResponseV2 mapToResponse(RoundV2 round) {
        List<DiplomaResponseV2> diplomaResponses = round.getDiplomas() != null ? 
                round.getDiplomas().stream()
                .map(d -> DiplomaResponseV2.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .build())
                .collect(Collectors.toList()) : List.of();

        return RoundResponseV2.builder()
                .id(round.getId())
                .name(round.getName())
                .startDate(round.getStartDate())
                .endDate(round.getEndDate())
                .diplomas(diplomaResponses)
                .totalDiplomas(diplomaResponses.size())
                .build();
    }
}
