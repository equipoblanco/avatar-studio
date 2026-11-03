package com.plataforma.avatar.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    private final FileValidationService fileValidationService;

    public FileStorageService(FileValidationService fileValidationService) {
        this.fileValidationService = fileValidationService;
    }

    public record StoredAssetFiles(String spriteUrl, String thumbnailUrl) {}

    /**
     * Sube y persiste el sprite de 512x512 y su miniatura de 128x128
     * En producción se conecta con el Bucket S3 o Cloudinary según el estudio de factibilidad.
     */
    public StoredAssetFiles storeAssetSprite(MultipartFile file, BufferedImage validatedImage) {
        String assetKey = UUID.randomUUID().toString();
        
        // Simulación de URL de almacenamiento de CDN para entorno dev/local
        String spriteUrl = "https://cdn.plataforma.com/sprites/toonix_" + assetKey + ".png";
        String thumbnailUrl = "https://cdn.plataforma.com/sprites/thumbs/toonix_" + assetKey + "_thumb.png";

        try {
            byte[] thumbBytes = fileValidationService.generateThumbnail(validatedImage, 128);
            // Aquí se despacha a S3/Cloudinary: s3Client.putObject(...)
        } catch (IOException e) {
            throw new RuntimeException("Error al procesar y almacenar miniatura gráfica", e);
        }

        return new StoredAssetFiles(spriteUrl, thumbnailUrl);
    }
}

