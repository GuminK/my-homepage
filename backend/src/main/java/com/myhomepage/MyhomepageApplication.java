package com.myhomepage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MyhomepageApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyhomepageApplication.class, args);
    }
}
