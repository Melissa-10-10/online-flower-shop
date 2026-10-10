package com.flowershop.service;

import com.flowershop.dto.AuthDto;
import com.flowershop.entity.Customer;
import com.flowershop.entity.User;
import com.flowershop.repository.CustomerRepository;
import com.flowershop.repository.UserRepository;
import com.flowershop.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new RuntimeException("Username already taken");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already registered");

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(User.Role.CUSTOMER)
            .build();
        userRepository.save(user);

        Customer customer = Customer.builder()
            .firstName(request.getFirstName() != null ? request.getFirstName() : request.getUsername())
            .lastName(request.getLastName() != null ? request.getLastName() : "")
            .phone(request.getPhone() != null ? request.getPhone() : "0000000000")
            .user(user)
            .build();
        customerRepository.save(customer);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails);
        return new AuthDto.AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        String token = jwtUtil.generateToken(userDetails);
        return new AuthDto.AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());
    }
}
