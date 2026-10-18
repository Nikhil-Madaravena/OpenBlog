package com.openblog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// CORS is configured centrally in config.SecurityConfiguration (origin-restricted, not wildcard)
// so it is not duplicated here.
@SpringBootApplication
public class OpenBlogApplication {

    public static void main(String[] args) {
        SpringApplication.run(OpenBlogApplication.class, args);
    }
}
