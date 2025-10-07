package com.pharmacy_backend.cms_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.pharmacy_backend.cms_service", "com.pharmacy_backend.common"})
public class CmsServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CmsServiceApplication.class, args);
	}

}
