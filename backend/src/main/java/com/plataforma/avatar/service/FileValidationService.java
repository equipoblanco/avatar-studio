package com.plataforma.avatar.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class FileValidationService {

    public static final int REQUIRED_WIDTH = 512;
    public static final int REQUIRED_HEIGHT = 512;
    public static final long MAX_FILE_SIZE_BYTES = 500 * 1024; // 500 KB
    public static final List<String> ALLOWED_MIME_TYPES = List.of("image/png", "image/webp");

    /**
     * Valida especificaciones técnicas estrictas del sprite estático 2D:
     * 1. Tamaño de archivo <= 500 KB
     * 2. Tipo MIME PNG o WebP
     * 3. Resolución exacta de 512x512 píxeles
     * 4. Presencia de canal alfa (transparencia limpia para composición por capas)
     */
    public BufferedImage validateSpriteFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo gráfico del sprite es obligatorio");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException(
                    "El archivo excede el tamaño máximo permitido de 500 KB (Tamaño recibido: " +
                    (file.getSize() / 1024) + " KB)"
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Formato de imagen inválido. Solo se admiten archivos PNG o WebP con transparencia (Recibido: " + contentType + ")"
            );
        }

        BufferedImage image;
        try {
            image = ImageIO.read(file.getInputStream());
        } catch (IOException e) {
            throw new IllegalArgumentException("No se pudo decodificar el archivo de imagen adjunto", e);
        }

        if (image == null) {
            throw new IllegalArgumentException("El contenido del archivo no corresponde a una imagen válida");
        }

        if (image.getWidth() != REQUIRED_WIDTH || image.getHeight() != REQUIRED_HEIGHT) {
            throw new IllegalArgumentException(
                    "Dimensiones incorrectas. El sprite debe tener exactamente " + REQUIRED_WIDTH +
                    "x" + REQUIRED_HEIGHT + " px para garantizar el encaje anatómico Toonix (Recibido: " +
                    image.getWidth() + "x" + image.getHeight() + " px)"
            );
        }

        // Validación de canal alfa (transparencia)
        if (!image.getColorModel().hasAlpha()) {
            throw new IllegalArgumentException(
                    "El sprite debe contar con canal alfa (transparencia). Las imágenes con fondo sólido no son compatibles con la composición multicapa."
            );
        }

        return image;
    }

    /**
     * Genera una miniatura cuadrada de 128x128 con canal alfa para el catálogo
     */
    public byte[] generateThumbnail(BufferedImage originalImage, int size) throws IOException {
        BufferedImage thumb = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = thumb.createGraphics();
        try {
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.drawImage(originalImage, 0, 0, size, size, null);
        } finally {
            g2d.dispose();
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(thumb, "png", baos);
        return baos.toByteArray();
    }
}

