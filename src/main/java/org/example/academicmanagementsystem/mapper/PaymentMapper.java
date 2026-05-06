package org.example.academicmanagementsystem.mapper;

import org.example.academicmanagementsystem.dto.PaymentResponse;
import org.example.academicmanagementsystem.model.Payment;
import org.example.academicmanagementsystem.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.name")
    @Mapping(target = "processedBy", source = "processedBy")
    PaymentResponse toPaymentResponse(Payment payment);

    List<PaymentResponse> toPaymentResponseList(List<Payment> payments);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "username", source = "username")
    @Mapping(target = "fullName", source = "fullName")
    PaymentResponse.ProcessedByInfo toProcessedByInfo(User user);
}
