package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.RoundRequestV2;
import org.example.academicmanagementsystem.dto.RoundResponseV2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoundV2Service {
    RoundResponseV2 createRound(RoundRequestV2 request);
    RoundResponseV2 updateRound(Long id, RoundRequestV2 request);
    RoundResponseV2 getRound(Long id);
    Page<RoundResponseV2> getAllRounds(Pageable pageable);
    void deleteRound(Long id);
}
