package com.plataforma.avatar.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Servicio encargado del almacenamiento físico de los archivos gráficos
 * (sprites y thumbnails).
 * 
 * <h3>Arquitectura y Escalabilidad (Plataforma de Juegos en Línea)</h3>
 * <p>
 * Actualmente, este servicio guarda los archivos en el disco duro local
 * (carpeta "uploads").
 * Esto es ideal para desarrollo local y entornos de prueba.
 * </p>
 * <p>
 * <b>Para producción (Nube):</b> Cuando la plataforma se despliegue a gran
 * escala, el cuerpo
 * de los métodos deberá cambiar para usar el SDK de un proveedor de Object
 * Storage
 * (AWS S3, Google Cloud Storage, Cloudinary, etc.).
 * La firma del método (entrada y salida) no cambiará, lo que significa que
 * ni los controladores ni el frontend necesitarán modificaciones.
 * </p>
 */
@Service
public class FileStorageService {

    private final FileValidationService fileValidationService;

    // Define la ruta relativa donde se guardarán las imágenes en el servidor actual
    private final Path rootLocation = Paths.get("uploads");

    public FileStorageService(FileValidationService fileValidationService) {
        this.fileValidationService = fileValidationService;

        // Aseguramos que la carpeta exista al iniciar la aplicación.
        // Si no existe, la crea. Si ya existe, no hace nada.
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo inicializar la carpeta de almacenamiento de imágenes", e);
        }
    }

    /**
     * DTO interno para devolver las dos URLs generadas (Sprite principal y
     * Thumbnail).
     */
    public record StoredAssetFiles(String spriteUrl, String thumbnailUrl) {
    }

    /**
     * Procesa y almacena un archivo de imagen subido, generando su versión completa
     * y una miniatura.
     * 
     * @param file           El archivo MultipartFile subido desde el frontend.
     * @param validatedImage La imagen ya decodificada y validada previamente
     *                       (512x512, PNG, alfa).
     * @return Un objeto StoredAssetFiles con las URLs públicas generadas.
     */
    public StoredAssetFiles storeAssetSprite(MultipartFile file, BufferedImage validatedImage) {
        try {
            // 1. Generar un identificador único para evitar colisiones de nombres
            String assetKey = UUID.randomUUID().toString();

            // 2. Guardar la imagen original (Sprite de alta resolución)
            String fileName = "sprite_" + assetKey + ".png";
            // Resolvemos la ruta absoluta para asegurar que no haya ataques de Path
            // Traversal
            Path destinationFile = this.rootLocation.resolve(Paths.get(fileName)).normalize().toAbsolutePath();
            Files.copy(file.getInputStream(), destinationFile);

            // 3. Generar y guardar la miniatura optimizada (128x128) para la cuadrícula del
            // catálogo
            String thumbName = "thumb_" + assetKey + ".png";
            Path thumbDestinationFile = this.rootLocation.resolve(Paths.get(thumbName)).normalize().toAbsolutePath();
            byte[] thumbBytes = fileValidationService.generateThumbnail(validatedImage, 128);
            Files.write(thumbDestinationFile, thumbBytes);

            // 4. Construir las URLs públicas apuntando al servidor actual (ej.
            // http://localhost:8080)
            // ServletUriComponentsBuilder obtiene dinámicamente el dominio y puerto.
            String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
            String spriteUrl = baseUrl + "/uploads/" + fileName;
            String thumbnailUrl = baseUrl + "/uploads/" + thumbName;

            return new StoredAssetFiles(spriteUrl, thumbnailUrl);

        } catch (IOException e) {
            throw new RuntimeException("Error crítico al procesar y almacenar el archivo gráfico en el disco", e);
        }
    }
}