package org.example.academicmanagementsystem.mapper;

import org.example.academicmanagementsystem.dto.*;
import org.example.academicmanagementsystem.model.Round;
import org.example.academicmanagementsystem.model.RoundDiploma;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {DiplomaMapper.class, UserMapper.class})
public interface RoundMapper {

    @Mapping(target = "diplomas", source = "roundDiplomas")
    RoundResponse toRoundResponse(Round round);

    List<RoundResponse> toRoundResponseList(List<Round> rounds);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "roundDiplomas", source = "diplomas")
    Round toRoundEntity(RoundRequest roundRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "round", ignore = true)
    @Mapping(target = "diploma", ignore = true)
    @Mapping(target = "instructor", ignore = true)
    @Mapping(target = "students", ignore = true)
    @Mapping(target = "currentEnrollment", constant = "0")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    RoundDiploma toRoundDiplomaEntity(RoundDiplomaRequest request);

    RoundDiplomaResponse toRoundDiplomaResponse(RoundDiploma roundDiploma);
}
