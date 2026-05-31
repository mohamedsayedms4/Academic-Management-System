package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.RoundDiplomaV2Request;
import org.example.academicmanagementsystem.dto.RoundDiplomaV2Response;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoundDiplomaV2Service {
    RoundDiplomaV2Response createDiploma(RoundDiplomaV2Request request);
    Page<RoundDiplomaV2Response> getDiplomas(String search, Long instructorId, Pageable pageable);
    RoundDiplomaV2Response getDiplomaById(Long id);
    RoundDiplomaV2Response updateDiploma(Long id, RoundDiplomaV2Request request);
    void deleteDiploma(Long id);
}
