package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.RoundDiplomaV2Request;
import org.example.academicmanagementsystem.dto.RoundDiplomaV2Response;
import org.example.academicmanagementsystem.model.DiplomaV2;
import org.example.academicmanagementsystem.model.InstructorV2;
import org.example.academicmanagementsystem.model.RoundDiplomaV2;
import org.example.academicmanagementsystem.model.RoundV2;
import org.example.academicmanagementsystem.repository.DiplomaV2Repository;
import org.example.academicmanagementsystem.repository.InstructorV2Repository;
import org.example.academicmanagementsystem.repository.RoundDiplomaV2Repository;
import org.example.academicmanagementsystem.repository.RoundV2Repository;
import org.example.academicmanagementsystem.service.RoundDiplomaV2Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoundDiplomaV2ServiceImpl implements RoundDiplomaV2Service {

    private final RoundDiplomaV2Repository roundDiplomaRepository;
    private final RoundV2Repository roundRepository;
    private final DiplomaV2Repository diplomaRepository;
    private final InstructorV2Repository instructorRepository;

    @Override
    @Transactional
    public RoundDiplomaV2Response createDiploma(RoundDiplomaV2Request request) {
        RoundV2 round = roundRepository.findById(request.getRoundId())
                .orElseThrow(() -> new RuntimeException("Round not found"));
        
        // Find or Create DiplomaV2 by name
        DiplomaV2 diploma = diplomaRepository.findByName(request.getDiplomaName())
                .orElseGet(() -> {
                    DiplomaV2 newDiploma = new DiplomaV2();
                    newDiploma.setName(request.getDiplomaName());
                    return diplomaRepository.save(newDiploma);
                });

        InstructorV2 instructor = request.getInstructorId() != null ? 
                instructorRepository.findById(request.getInstructorId()).orElse(null) : null;

        RoundDiplomaV2 rd = new RoundDiplomaV2();
        rd.setRound(round);
        rd.setDiploma(diploma);
        rd.setInstructor(instructor);
        mapRequestToEntity(request, rd);

        RoundDiplomaV2 saved = roundDiplomaRepository.save(rd);

        // Ensure the diploma is also added to the ManyToMany relationship
        if (round.getDiplomas() == null) {
            round.setDiplomas(new java.util.HashSet<>());
        }
        if (!round.getDiplomas().contains(diploma)) {
            round.getDiplomas().add(diploma);
            roundRepository.save(round);
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoundDiplomaV2Response> getDiplomas(String search, Long instructorId, Pageable pageable) {
        Page<RoundDiplomaV2> diplomas;
        if (search != null && !search.isEmpty() && instructorId != null) {
            diplomas = roundDiplomaRepository.searchDiplomasByInstructor(search, instructorId, pageable);
        } else if (search != null && !search.isEmpty()) {
            diplomas = roundDiplomaRepository.searchDiplomas(search, pageable);
        } else if (instructorId != null) {
            diplomas = roundDiplomaRepository.findByInstructorId(instructorId, pageable);
        } else {
            diplomas = roundDiplomaRepository.findAll(pageable);
        }
        return diplomas.map(this::mapToResponse);
    }

    @Override
    public RoundDiplomaV2Response getDiplomaById(Long id) {
        RoundDiplomaV2 rd = roundDiplomaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RoundDiploma not found"));
        return mapToResponse(rd);
    }

    @Override
    @Transactional
    public RoundDiplomaV2Response updateDiploma(Long id, RoundDiplomaV2Request request) {
        RoundDiplomaV2 rd = roundDiplomaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RoundDiploma not found"));
        
        InstructorV2 instructor = request.getInstructorId() != null ? 
                instructorRepository.findById(request.getInstructorId()).orElse(null) : null;
        
        rd.setInstructor(instructor);

        if (request.getRoundId() != null && !request.getRoundId().equals(rd.getRound().getId())) {
            RoundV2 round = roundRepository.findById(request.getRoundId())
                    .orElseThrow(() -> new RuntimeException("Round not found"));
            rd.setRound(round);
            
            // Ensure the diploma is also added to the ManyToMany relationship
            if (round.getDiplomas() == null) {
                round.setDiplomas(new java.util.HashSet<>());
            }
            if (!round.getDiplomas().contains(rd.getDiploma())) {
                round.getDiplomas().add(rd.getDiploma());
                roundRepository.save(round);
            }
        }

        if (request.getDiplomaName() != null && !request.getDiplomaName().equals(rd.getDiploma().getName())) {
            DiplomaV2 diploma = diplomaRepository.findByName(request.getDiplomaName())
                    .orElseGet(() -> {
                        DiplomaV2 newDiploma = new DiplomaV2();
                        newDiploma.setName(request.getDiplomaName());
                        return diplomaRepository.save(newDiploma);
                    });
            rd.setDiploma(diploma);
            
            // Also add to round if not present
            if (rd.getRound() != null) {
                if (rd.getRound().getDiplomas() == null) {
                    rd.getRound().setDiplomas(new java.util.HashSet<>());
                }
                if (!rd.getRound().getDiplomas().contains(diploma)) {
                    rd.getRound().getDiplomas().add(diploma);
                    roundRepository.save(rd.getRound());
                }
            }
        }

        mapRequestToEntity(request, rd);

        RoundDiplomaV2 updated = roundDiplomaRepository.save(rd);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteDiploma(Long id) {
        roundDiplomaRepository.deleteById(id);
    }

    private void mapRequestToEntity(RoundDiplomaV2Request request, RoundDiplomaV2 rd) {
        rd.setTotalPrice(request.getTotalPrice());
        rd.setStartDate(request.getStartDate());
        rd.setEndDate(request.getEndDate());
        rd.setTotalStudents(request.getTotalStudents());
        
        rd.setInstallment1Percent(request.getInstallment1Percent());
        rd.setInstallment2Percent(request.getInstallment2Percent());
        rd.setInstallment3Percent(request.getInstallment3Percent());
        rd.setInstallment4Percent(request.getInstallment4Percent());
        
        rd.setInstallment1Amount(request.getInstallment1Amount());
        rd.setInstallment2Amount(request.getInstallment2Amount());
        rd.setInstallment3Amount(request.getInstallment3Amount());
        rd.setInstallment4Amount(request.getInstallment4Amount());
        
        rd.setInstallment1Date(request.getInstallment1Date());
        rd.setInstallment2Date(request.getInstallment2Date());
        rd.setInstallment3Date(request.getInstallment3Date());
        rd.setInstallment4Date(request.getInstallment4Date());
    }

    private RoundDiplomaV2Response mapToResponse(RoundDiplomaV2 rd) {
        RoundDiplomaV2Response res = new RoundDiplomaV2Response();
        res.setId(rd.getId());
        res.setRoundId(rd.getRound().getId());
        res.setRoundName(rd.getRound().getName());
        res.setDiplomaId(rd.getDiploma().getId());
        res.setDiplomaName(rd.getDiploma().getName());
        res.setInstructorId(rd.getInstructor() != null ? rd.getInstructor().getId() : null);
        res.setInstructorName(rd.getInstructor() != null ? rd.getInstructor().getName() : "N/A");
        res.setTotalPrice(rd.getTotalPrice());
        res.setStartDate(rd.getStartDate());
        res.setEndDate(rd.getEndDate());
        res.setTotalStudents(rd.getTotalStudents());
        res.setCurrentEnrollment(rd.getCurrentEnrollment());
        
        res.setInstallment1Percent(rd.getInstallment1Percent());
        res.setInstallment2Percent(rd.getInstallment2Percent());
        res.setInstallment3Percent(rd.getInstallment3Percent());
        res.setInstallment4Percent(rd.getInstallment4Percent());
        
        res.setInstallment1Amount(rd.getInstallment1Amount());
        res.setInstallment2Amount(rd.getInstallment2Amount());
        res.setInstallment3Amount(rd.getInstallment3Amount());
        res.setInstallment4Amount(rd.getInstallment4Amount());
        
        res.setInstallment1Date(rd.getInstallment1Date());
        res.setInstallment2Date(rd.getInstallment2Date());
        res.setInstallment3Date(rd.getInstallment3Date());
        res.setInstallment4Date(rd.getInstallment4Date());
        
        return res;
    }
}
