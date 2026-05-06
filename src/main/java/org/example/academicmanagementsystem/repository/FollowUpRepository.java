package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
}
