package repository.impl;

import config.Config;
import dto.Log;
import enums.LogLevelEnum;
import exceptions.FileException;
import exceptions.LogParsingException;
import repository.LogRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public class LogRepositoryImpl implements LogRepository {

    private static final DateTimeFormatter FORMATTER = Config.getDateTimeFormatter();

    private final String filePath;

    public LogRepositoryImpl() {
        this.filePath = Config.getFilePath();
    }

    @Override
    public List<Log> findAll() {
        try {
            List<String> lines = Files.readAllLines(Path.of(filePath));
            List<Log> logs = new ArrayList<>();
            for (String line : lines) {
                logs.add(parseLogLine(line));
            }
            return logs;
        } catch (IOException e) {
            throw new FileException("Cannot read log file", e);
        }
    }


    public Log parseLogLine(String line) throws LogParsingException {
        try {
            int firstOpenIndex = line.indexOf('[');
            int firstCloseIndex = line.indexOf(']');

            String firstElement = line.substring(firstOpenIndex + 1, firstCloseIndex);
            LocalDateTime timeStamp = LocalDateTime.parse(firstElement, FORMATTER);

            int secondOpenIndex = line.indexOf('[', firstOpenIndex + 1);
            int secondCloseIndex = line.indexOf(']', secondOpenIndex + 1);
            String secondElement = line.substring(secondOpenIndex + 1, secondCloseIndex);

            int thirdOpenIndex = line.indexOf('[', secondOpenIndex + 1);
            int thirdCloseIndex = line.indexOf(']', secondCloseIndex + 1);
            String thirdElement = line.substring(thirdOpenIndex + 1, thirdCloseIndex);

            int finalDash = line.indexOf("- ");
            String finalElement = line.substring(finalDash + 1);

            return new Log(line, timeStamp, LogLevelEnum.valueOf(secondElement.toUpperCase()), thirdElement, finalElement);
        } catch (DateTimeParseException e) {
            throw new LogParsingException("Invalid Date/time format", line, e);
        } catch (IllegalArgumentException e) {
            throw new LogParsingException("Invalid log level value", line, e);
        } catch (IndexOutOfBoundsException e) {
            throw new LogParsingException("Log line format error (substring index out of bounds)", line, e);
        } catch (Exception e) {
            throw new LogParsingException("Unexpected error during log line parsing", line, e);
        }
    }
}
