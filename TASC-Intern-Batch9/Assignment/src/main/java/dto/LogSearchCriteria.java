package dto;

import enums.LogLevelEnum;

import java.time.LocalDateTime;

public class LogSearchCriteria {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LogLevelEnum logLevel;
    private String message;

    public LogSearchCriteria(LocalDateTime startTime, LocalDateTime endTime, LogLevelEnum logLevel, String message) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.logLevel = logLevel;
        this.message = (message != null && !message.isEmpty()) ? message.toLowerCase() : null;
    }

    public LogSearchCriteria() {
        super();
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public LogLevelEnum getLogLevel() {
        return logLevel;
    }

    public void setLogLevel(LogLevelEnum logLevel) {
        this.logLevel = logLevel;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public static class Builder {
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private LogLevelEnum logLevel;
        private String message;

        public Builder startTime(LocalDateTime startTime) {
            this.startTime = startTime;
            return this;
        }

        public Builder endTime(LocalDateTime endTime) {
            this.endTime = endTime;
            return this;
        }

        public Builder logLevel(LogLevelEnum logLevel) {
            this.logLevel = logLevel;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public LogSearchCriteria build() {
            return new LogSearchCriteria(startTime, endTime, logLevel, message);
        }


    }

    public boolean hasCriteria() {
        return startTime != null || endTime != null || logLevel != null || message != null;
    }
}
