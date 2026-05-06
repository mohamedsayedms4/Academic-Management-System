package org.example.academicmanagementsystem.service;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.DiplomaResponse;
import org.example.academicmanagementsystem.mapper.DiplomaMapper;
import org.example.academicmanagementsystem.model.Diploma;
import org.example.academicmanagementsystem.repository.DiplomaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DiplomaService {

    private final DiplomaRepository diplomaRepository;
    private final DiplomaMapper diplomaMapper;

    public List<DiplomaResponse> findAll() {
        return diplomaMapper.toDiplomaResponseList(diplomaRepository.findAll());
    }

    public Optional<DiplomaResponse> findById(Long id) {
        return diplomaRepository.findById(id).map(diplomaMapper::toDiplomaResponse);
    }

    @Transactional
    public DiplomaResponse create(String name, String description) {
        Diploma diploma = new Diploma();
        diploma.setName(name);
        diploma.setDescription(description);
        return diplomaMapper.toDiplomaResponse(diplomaRepository.save(diploma));
    }

    @Transactional
    public Optional<DiplomaResponse> update(Long id, String name, String description) {
        return diplomaRepository.findById(id).map(diploma -> {
            diploma.setName(name);
            diploma.setDescription(description);
            return diplomaMapper.toDiplomaResponse(diplomaRepository.save(diploma));
        });
    }

    @Transactional
    public void delete(Long id) {
        diplomaRepository.deleteById(id);
    }
}
