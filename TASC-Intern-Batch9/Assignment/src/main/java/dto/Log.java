package dto;

import enums.LogLevelEnum;

import java.time.LocalDateTime;

public class Log {

    private String fullLog;
    private LocalDateTime dateTime;
    private LogLevelEnum level;
    private String service;
    private String message;

    public Log() {

    }

    public Log(String fullLog, LocalDateTime dateTime, LogLevelEnum level, String service, String message) {
        this.fullLog = fullLog;
        this.dateTime = dateTime;
        this.level = level;
        this.service = service;
        this.message = message;
    }

    public String getFullLog() {
        return fullLog;
    }

    public void setFullLog(String fullLog) {
        this.fullLog = fullLog;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public LogLevelEnum getLevel() {
        return level;
    }

    public void setLevel(LogLevelEnum level) {
        this.level = level;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
