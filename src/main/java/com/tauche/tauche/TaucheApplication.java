package com.tauche.tauche;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TaucheApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaucheApplication.class, args);
	}

}
