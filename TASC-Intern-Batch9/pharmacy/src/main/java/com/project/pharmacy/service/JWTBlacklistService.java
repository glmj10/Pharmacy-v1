package com.project.pharmacy.service;


import java.text.ParseException;

public interface JWTBlacklistService {
    boolean isTokenInvalidated(String token) throws ParseException;
    boolean isTokenExpired(String token) throws ParseException;
    boolean isTokenVersionHasUpdated(String token) throws ParseException;
}
