package service.impl;

import config.ThreadConfig;
import dto.Log;
import dto.LogSearchCriteria;
import exceptions.LogSearchException;
import repository.LogRepository;
import repository.impl.LogRepositoryImpl;
import service.LogService;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

public class LogServiceImpl implements LogService {

    private final LogRepository logRepository;

    public LogServiceImpl() {
        this.logRepository = new LogRepositoryImpl();
    }

    @Override
    public List<Log> getAll() {
        return logRepository.findAll();
    }

    @Override
    public List<Log> search(LogSearchCriteria criteria) {
        ExecutorService executor = ThreadConfig.getExecutorService();
        List<Log> allLogs = logRepository.findAll();

        int chunkSize = Math.max(allLogs.size() / ThreadConfig.getThreadPoolSize(), 1);

        List<Future<List<Log>>> futures = new ArrayList<>();

        for (int i = 0; i < allLogs.size(); i += chunkSize) {
            int to = Math.min(i + chunkSize, allLogs.size());
            List<Log> subList = allLogs.subList(i, to);

            Future<List<Log>> future = executor.submit(() ->
                    subList.stream()
                            .filter(log -> (criteria.getStartTime() == null || !log.getDateTime().isBefore(criteria.getStartTime())))
                            .filter(log -> (criteria.getEndTime() == null || !log.getDateTime().isAfter(criteria.getEndTime())))
                            .filter(log -> (criteria.getLogLevel() == null || log.getLevel().equals(criteria.getLogLevel())))
                            .filter(log -> (criteria.getMessage() == null || log.getMessage().toLowerCase().contains(criteria.getMessage().toLowerCase())))
                            .collect(Collectors.toList())
            );

            futures.add(future);
        }

        List<Log> result = new ArrayList<>();
        for (Future<List<Log>> f : futures) {
            try {
                result.addAll(f.get()); // gom kết quả
            } catch (InterruptedException | ExecutionException e) {
                throw new LogSearchException("Error while add log to result");
            }
        }

        return result;
    }

    @Override
    public void showLog(List<Log> logList) {
        for(Log item: logList) {
            System.out.println(item.getFullLog());
        }
    }

}
