package org.example.academicmanagementsystem.mapper;

import org.example.academicmanagementsystem.dto.RoundRequest;
import org.example.academicmanagementsystem.dto.RoundResponse;
import org.example.academicmanagementsystem.model.Round;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoundMapper {

    RoundResponse toRoundResponse(Round round);

    List<RoundResponse> toRoundResponseList(List<Round> rounds);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "students", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Round toRoundEntity(RoundRequest roundRequest);
}
