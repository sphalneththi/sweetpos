package com.sweetpos.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final Duration accessExpiry;
    private final Duration refreshExpiry;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-expiry}") String accessExpiryStr,
            @Value("${app.jwt.refresh-expiry}") String refreshExpiryStr) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiry = parseDuration(accessExpiryStr);
        this.refreshExpiry = parseDuration(refreshExpiryStr);
    }

    public String generateAccessToken(UUID userId, String username, String role) {
        return Jwts.builder()
                .subject(userId.toString())
                .claims(Map.of("username", username, "role", role))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiry.toMillis()))
                .signWith(signingKey)
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        return Jwts.builder()
                .subject(userId.toString())
                .claims(Map.of("type", "refresh"))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiry.toMillis()))
                .signWith(signingKey)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public UUID getUserId(String token) {
        return UUID.fromString(parseToken(token).getSubject());
    }

    private Duration parseDuration(String str) {
        str = str.trim().toLowerCase();
        if (str.endsWith("h")) return Duration.ofHours(Long.parseLong(str.replace("h", "")));
        if (str.endsWith("d")) return Duration.ofDays(Long.parseLong(str.replace("d", "")));
        if (str.endsWith("m")) return Duration.ofMinutes(Long.parseLong(str.replace("m", "")));
        return Duration.ofHours(8); // default
    }
}
