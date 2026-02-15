package org.example.academicmanagementsystem.mapper;

import org.example.academicmanagementsystem.dto.LeadDetailResponse;
import org.example.academicmanagementsystem.dto.LeadRequest;
import org.example.academicmanagementsystem.dto.LeadResponse;
import org.example.academicmanagementsystem.model.FollowUp;
import org.example.academicmanagementsystem.model.Lead;
import org.example.academicmanagementsystem.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LeadMapper {

    // Map Lead entity to LeadResponse (without follow-ups)
    @Mapping(target = "teleSales", source = "teleSales")
    LeadResponse toLeadResponse(Lead lead);

    // Map Lead entity to LeadDetailResponse (with follow-ups)
    @Mapping(target = "teleSales", source = "teleSales")
    @Mapping(target = "followUps", source = "followUps")
    LeadDetailResponse toLeadDetailResponse(Lead lead);

    // Map list of Lead entities to list of LeadResponse
    List<LeadResponse> toLeadResponseList(List<Lead> leads);

    // Map User to TeleSalesInfo
    @Mapping(target = "id", source = "id")
    @Mapping(target = "username", source = "username")
    @Mapping(target = "fullName", source = "fullName")
    LeadResponse.TeleSalesInfo toTeleSalesInfo(User user);

    // Map User to TeleSalesInfo for detail response
    @Mapping(target = "id", source = "id")
    @Mapping(target = "username", source = "username")
    @Mapping(target = "fullName", source = "fullName")
    LeadDetailResponse.TeleSalesInfo toDetailTeleSalesInfo(User user);

    // Convert LeadRequest to Lead entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "teleSales", ignore = true) // Will be set manually using teleSalesId
    @Mapping(target = "followUps", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Lead toLeadEntity(LeadRequest leadRequest);

    // Map FollowUp to FollowUpInfo
    @Mapping(target = "id", source = "id")
    @Mapping(target = "sequence", source = "sequence")
    @Mapping(target = "message", source = "message")
    @Mapping(target = "createdAt", source = "createdAt")
    LeadDetailResponse.FollowUpInfo toFollowUpInfo(FollowUp followUp);

    // Map list of FollowUp to list of FollowUpInfo
    List<LeadDetailResponse.FollowUpInfo> toFollowUpInfoList(List<FollowUp> followUps);
}
