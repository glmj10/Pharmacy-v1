package com.pharmacy.infra_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableConfigServer
@SpringBootApplication
@EnableEurekaServer
public class InfraServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(InfraServiceApplication.class, args);
	}

}
