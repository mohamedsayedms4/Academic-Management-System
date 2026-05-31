package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.RoundDiplomaV2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoundDiplomaV2Repository extends JpaRepository<RoundDiplomaV2, Long> {

    @Query("SELECT rd FROM RoundDiplomaV2 rd WHERE " +
           "LOWER(rd.diploma.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(rd.instructor.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<RoundDiplomaV2> searchDiplomas(@Param("search") String search, Pageable pageable);

    java.util.List<RoundDiplomaV2> findByRound(org.example.academicmanagementsystem.model.RoundV2 round);

    java.util.Optional<RoundDiplomaV2> findByRoundAndDiploma(org.example.academicmanagementsystem.model.RoundV2 round, org.example.academicmanagementsystem.model.DiplomaV2 diploma);
}
