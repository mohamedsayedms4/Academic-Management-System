package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.RoundDiplomaV2;
import org.example.academicmanagementsystem.model.StudentTaskV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentTaskV2Repository extends JpaRepository<StudentTaskV2, Long> {
    List<StudentTaskV2> findByRoundDiploma(RoundDiplomaV2 roundDiploma);
}
