package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class DocumentRenouvellementResponse {

    private Long id;
    private Long renouvellementId;
    private String nomDocument;
    private boolean recu;
}
