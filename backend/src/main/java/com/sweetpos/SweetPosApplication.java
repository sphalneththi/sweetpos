package com.sweetpos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SweetPosApplication {
    public static void main(String[] args) {
        SpringApplication.run(SweetPosApplication.class, args);
    }
}
