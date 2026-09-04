package com.hrithik.linktrack;

import com.hrithik.linktrack.util.ShortCodeGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ShortCodeGeneratorTest {

    private ShortCodeGenerator shortCodeGenerator;

    @BeforeEach
    void setUp() {
        shortCodeGenerator = new ShortCodeGenerator();
    }

    @Test
    void testGenerateReturns7Characters() {
        String code = shortCodeGenerator.generate();
        assertNotNull(code);
        assertEquals(7, code.length());
        assertTrue(code.matches("^[a-zA-Z0-9]{7}$"));
    }

    @Test
    void testUniquenessAcrossMultipleGenerations() {
        Set<String> codes = new HashSet<>();
        int iterations = 1000;
        for (int i = 0; i < iterations; i++) {
            String code = shortCodeGenerator.generate();
            codes.add(code);
        }
        assertEquals(iterations, codes.size(), "Short codes should be unique");
    }

    @Test
    void testReservedPathsDetection() {
        assertTrue(shortCodeGenerator.isReserved("api"));
        assertTrue(shortCodeGenerator.isReserved("API"));
        assertTrue(shortCodeGenerator.isReserved("login"));
        assertTrue(shortCodeGenerator.isReserved("dashboard"));
        assertTrue(shortCodeGenerator.isReserved("actuator"));
        assertTrue(shortCodeGenerator.isReserved("swagger-ui"));
        assertFalse(shortCodeGenerator.isReserved("mycustomlink"));
        assertFalse(shortCodeGenerator.isReserved("aB72xK9"));
    }
}
