package service;

import dto.Log;
import dto.LogSearchCriteria;

import java.util.List;

public interface LogService {

    List<Log> getAll();
    List<Log> search(LogSearchCriteria criteria);
    void showLog(List<Log> logList);
}
