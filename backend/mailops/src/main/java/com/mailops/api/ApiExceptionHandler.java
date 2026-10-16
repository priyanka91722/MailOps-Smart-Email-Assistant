package com.mailops.api;

import com.mailops.email.EmailGenerationException;
import com.mailops.email.GeminiConfigurationException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("The request is invalid.");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleUnreadableBody() {
        return ResponseEntity.badRequest().body(Map.of(
                "error",
                "Invalid request body. Check the email content, tone, and length values."));
    }

    @ExceptionHandler(GeminiConfigurationException.class)
    public ResponseEntity<Map<String, String>> handleMissingGeminiConfiguration() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "error",
                "Gemini is not configured. Add GEMINI_API_KEY to your environment secrets."));
    }

    @ExceptionHandler(EmailGenerationException.class)
    public ResponseEntity<Map<String, String>> handleGenerationFailure(EmailGenerationException exception) {
        logger.warn("Gemini reply generation failed ({})", exception.getCause() == null
                ? exception.getClass().getSimpleName()
                : exception.getCause().getClass().getSimpleName());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "error",
                "Gemini could not generate a reply. Check the API key, model access, or Gemini service status."));
    }
}
