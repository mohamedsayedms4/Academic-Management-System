package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.InstructorRequestV2;
import org.example.academicmanagementsystem.dto.InstructorResponseV2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InstructorV2Service {
    InstructorResponseV2 createInstructor(InstructorRequestV2 request);
    InstructorResponseV2 updateInstructor(Long id, InstructorRequestV2 request);
    void deleteInstructor(Long id);
    InstructorResponseV2 getInstructor(Long id);
    Page<InstructorResponseV2> getAllInstructors(Pageable pageable, String search);
    java.util.List<InstructorResponseV2> getAllInstructorsList();
}
