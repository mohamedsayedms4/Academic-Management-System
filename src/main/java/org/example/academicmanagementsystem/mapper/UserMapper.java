package org.example.academicmanagementsystem.mapper;

import org.example.academicmanagementsystem.dto.RegisterRequest;
import org.example.academicmanagementsystem.dto.UserResponse;
import org.example.academicmanagementsystem.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toUserResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "password", ignore = true) // Password will be encoded separately
    User toUser(RegisterRequest registerRequest);
}
