package org.example.academicmanagementsystem.mapper;

import org.example.academicmanagementsystem.dto.SalesV2Request;
import org.example.academicmanagementsystem.dto.SalesV2Response;
import org.example.academicmanagementsystem.model.SalesV2;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SalesV2Mapper {

    SalesV2Response toResponse(SalesV2 sales);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "joinDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    SalesV2 toEntity(SalesV2Request request);
}
