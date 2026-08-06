package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentRenouvellementRequest {

    @NotBlank(message = "Le nom du document est obligatoire")
    private String nomDocument;
}
