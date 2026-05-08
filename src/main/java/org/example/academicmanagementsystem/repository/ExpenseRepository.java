package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseDateBetween(LocalDate start, LocalDate end);
}
