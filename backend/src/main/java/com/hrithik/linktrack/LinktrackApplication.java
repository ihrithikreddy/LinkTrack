package com.hrithik.linktrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LinktrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(LinktrackApplication.class, args);
    }
}
