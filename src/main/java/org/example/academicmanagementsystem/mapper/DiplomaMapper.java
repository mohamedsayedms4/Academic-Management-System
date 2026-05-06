package org.example.academicmanagementsystem.mapper;

import org.example.academicmanagementsystem.dto.DiplomaResponse;
import org.example.academicmanagementsystem.model.Diploma;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DiplomaMapper {
     DiplomaResponse toDiplomaResponse(Diploma diploma);
     List<DiplomaResponse> toDiplomaResponseList(List<Diploma> diplomas);
}
