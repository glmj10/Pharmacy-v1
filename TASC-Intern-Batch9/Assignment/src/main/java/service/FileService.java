package service;

import dto.Log;

import java.util.List;

public interface FileService {
    void exportFile(List<Log> logList);
}
