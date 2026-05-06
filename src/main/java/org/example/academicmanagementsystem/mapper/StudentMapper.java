package org.example.academicmanagementsystem.mapper;

import org.example.academicmanagementsystem.dto.StudentResponse;
import org.example.academicmanagementsystem.model.RoundDiploma;
import org.example.academicmanagementsystem.model.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {DiplomaMapper.class})
public interface StudentMapper {

    @Mapping(target = "round", source = "roundDiploma")
    StudentResponse toStudentResponse(Student student);

    List<StudentResponse> toStudentResponseList(List<Student> students);

    @Mapping(target = "id", source = "round.id")
    @Mapping(target = "name", source = "round.name")
    @Mapping(target = "diplomaName", source = "diploma.name")
    StudentResponse.RoundInfo toRoundInfo(RoundDiploma roundDiploma);
}
