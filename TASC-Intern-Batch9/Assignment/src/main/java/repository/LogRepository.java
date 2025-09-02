package repository;

import dto.Log;

import java.util.List;

public interface LogRepository {
    List<Log> findAll();
}
