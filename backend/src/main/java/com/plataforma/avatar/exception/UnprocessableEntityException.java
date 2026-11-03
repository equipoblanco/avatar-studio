package com.plataforma.avatar.exception;

/**
 * Excepción lanzada cuando la petición es sintácticamente correcta pero
 * contiene violaciones de integridad de negocio o incompatibilidad defensiva (HTTP 422).
 */
public class UnprocessableEntityException extends RuntimeException {
    public UnprocessableEntityException(String message) {
        super(message);
    }
}
