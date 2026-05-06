package org.example.academicmanagementsystem.mapper;

import org.example.academicmanagementsystem.dto.StudentResponse;
import org.example.academicmanagementsystem.model.Round;
import org.example.academicmanagementsystem.model.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StudentMapper {

    @Mapping(target = "round", source = "round")
    StudentResponse toStudentResponse(Student student);

    List<StudentResponse> toStudentResponseList(List<Student> students);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "diplomaName", source = "diplomaName")
    StudentResponse.RoundInfo toRoundInfo(Round round);
}
