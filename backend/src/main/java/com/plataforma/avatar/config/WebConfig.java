package com.plataforma.avatar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de Spring MVC para exponer recursos estáticos (imágenes,
 * archivos).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Mapea la ruta URL "/uploads/**" a la carpeta física "uploads/" en el
     * servidor.
     * 
     * <h3>¿Por qué es necesario?</h3>
     * <p>
     * Por defecto, Spring Boot no permite que los navegadores accedan a archivos
     * del disco duro por seguridad. Al añadir este "Resource Handler", le decimos:
     * "Permite que el navegador haga peticiones GET a las imágenes dentro de esta
     * carpeta".
     * </p>
     * <p>
     * En producción con AWS S3 o Cloudinary, este archivo se puede eliminar o
     * dejar vacío, ya que las imágenes vendrían de un dominio externo (CDN).
     * </p>
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}