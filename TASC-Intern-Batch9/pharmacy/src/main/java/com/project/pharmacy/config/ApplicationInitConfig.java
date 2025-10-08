package com.project.pharmacy.config;


import com.project.pharmacy.dto.request.RegistrationRequest;
import com.project.pharmacy.entity.Role;
import com.project.pharmacy.entity.User;
import com.project.pharmacy.mapper.UserMapper;
import com.project.pharmacy.repository.RoleRepository;
import com.project.pharmacy.repository.UserRepository;
import com.project.pharmacy.service.AuthService;
import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    @Value("${default-admin.email}")
    private String email;
    @Value("${default-admin.password}")
    private String password;
    @Bean
    ApplicationRunner applicationRunner(UserRepository repository) {
        return args -> {
            if(userRepository.count() == 0) {
                for(int i = 0; i < 40; i++ ) {
                    Faker faker = new Faker();
                    User user = new User();
                    user.setEmail(faker.internet().emailAddress());
                    user.setUsername(faker.name().fullName());
                    user.setPassword(passwordEncoder.encode("123456"));
                    Role role = roleRepository.findByCode("USER")
                            .orElseThrow(() -> new RuntimeException("User role not found"));
                    user.getRoles().add(role);
                    user.setStatusEmail(true);
                    repository.save(user);
                }
            }

            if(!repository.existsByEmail(email)) {
                User user = new User();
                user.setUsername("Admin");
                user.setEmail(email);
                user.setActiveEmail(true);
                user.setPassword(passwordEncoder.encode(password));
                Role role = roleRepository.findByCode("ADMIN")
                        .orElseThrow(() -> new RuntimeException("Admin role not found"));
                user.getRoles().add(role);
                repository.save(user);
            }

            System.out.println("Application has started successfully!");
        };
    }
}
