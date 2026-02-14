package org.example.academicmanagementsystem.mapper;

import org.example.academicmanagementsystem.dto.UserResponse;
import org.example.academicmanagementsystem.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toUserResponse(User user);
}
