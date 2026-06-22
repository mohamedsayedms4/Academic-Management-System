package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "leads")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE leads SET deleted = true WHERE id=?")
@org.hibernate.annotations.SQLRestriction("deleted = false")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Lead extends BaseEntity{

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phoneNumber;

    private String source;

    @ManyToOne
    @JoinColumn(name = "diploma_id")
    private DiplomaV2 diploma;

    @Column(columnDefinition = "TEXT")
    private String moderatorNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadStatus status = LeadStatus.OPEN;

    private String closureReason;


    @ManyToOne
    @JoinColumn(name = "tele_sales_id")
    private User teleSales;


    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FollowUp> followUps;
}
