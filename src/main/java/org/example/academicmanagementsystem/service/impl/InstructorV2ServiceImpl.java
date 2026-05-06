package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.DiplomaResponseV2;
import org.example.academicmanagementsystem.dto.InstructorRequestV2;
import org.example.academicmanagementsystem.dto.InstructorResponseV2;
import org.example.academicmanagementsystem.model.DiplomaV2;
import org.example.academicmanagementsystem.model.InstructorV2;
import org.example.academicmanagementsystem.repository.DiplomaV2Repository;
import org.example.academicmanagementsystem.repository.InstructorV2Repository;
import org.example.academicmanagementsystem.service.InstructorV2Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstructorV2ServiceImpl implements InstructorV2Service {

    private final InstructorV2Repository instructorRepository;
    private final DiplomaV2Repository diplomaRepository;

    @Override
    @Transactional
    public InstructorResponseV2 createInstructor(InstructorRequestV2 request) {
        InstructorV2 instructor = new InstructorV2();
        updateInstructorFields(instructor, request);
        return mapToResponse(instructorRepository.save(instructor));
    }

    @Override
    @Transactional
    public InstructorResponseV2 updateInstructor(Long id, InstructorRequestV2 request) {
        InstructorV2 instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));
        updateInstructorFields(instructor, request);
        return mapToResponse(instructorRepository.save(instructor));
    }

    @Override
    @Transactional
    public void deleteInstructor(Long id) {
        instructorRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public InstructorResponseV2 getInstructor(Long id) {
        InstructorV2 instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));
        return mapToResponse(instructor);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InstructorResponseV2> getAllInstructors(Pageable pageable, String search) {
        Page<InstructorV2> instructors;
        if (search != null && !search.isEmpty()) {
            instructors = instructorRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            instructors = instructorRepository.findAll(pageable);
        }
        return instructors.map(this::mapToResponse);
    }

    private void updateInstructorFields(InstructorV2 instructor, InstructorRequestV2 request) {
        instructor.setName(request.getName());
        instructor.setPhoneNumber(request.getPhoneNumber());
        instructor.setSalary(request.getSalary());
        instructor.setPaymentMethod(request.getPaymentMethod());

        if (request.getAssignedDiplomaIds() != null) {
            List<DiplomaV2> diplomas = diplomaRepository.findAllById(request.getAssignedDiplomaIds());
            instructor.setAssignedDiplomas(new HashSet<>(diplomas));
        }
    }

    private InstructorResponseV2 mapToResponse(InstructorV2 instructor) {
        List<DiplomaResponseV2> diplomaResponses = instructor.getAssignedDiplomas().stream()
                .map(d -> DiplomaResponseV2.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .build())
                .collect(Collectors.toList());

        return InstructorResponseV2.builder()
                .id(instructor.getId())
                .name(instructor.getName())
                .phoneNumber(instructor.getPhoneNumber())
                .salary(instructor.getSalary())
                .paymentMethod(instructor.getPaymentMethod())
                .assignedDiplomas(diplomaResponses)
                .build();
    }
}
