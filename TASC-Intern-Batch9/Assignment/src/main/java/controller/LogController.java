package controller;

import config.Config;
import dto.Log;
import dto.LogSearchCriteria;
import enums.LogLevelEnum;
import exceptions.InvalidInputException;
import service.LogService;
import service.impl.LogServiceImpl;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Scanner;

public class LogController {
    private final LogService logService;
    private final Scanner scanner;
    private final DateTimeFormatter FORMATTER = Config.getDateTimeFormatter();
    private List<Log> res;


    public LogController() {
        this.scanner = new Scanner(System.in);
        this.logService = new LogServiceImpl();
    }

    public void showMenu() {
        while (true) {
            System.out.println("\n========== LOG SEARCHER ==========");
            System.out.println("1. Search by Log Level");
            System.out.println("2. Search by Time Range");
            System.out.println("3. Search by Message Content");
            System.out.println("4. Advanced Search (Multiple Criteria)");
            System.out.println("5. View All Logs");
            System.out.println("6. Export Search Results");
            System.out.println("0. Exit");
            System.out.print("Choose an option: ");

            try {
                int choice = Integer.parseInt(scanner.nextLine());

                switch (choice) {
                    case 1:
                        searchByLogLevel();
                        break;
                    case 2:
                        searchByTimeRange();
                        break;
                    case 3:
                        searchByMessage();
                        break;
                    case 4:
                        advancedSearch();
                        break;
                    case 5:
                        viewAllLogs();
                        break;
                    case 6:
                        exportResults();
                        break;
                    case 0:
                        System.out.println("Goodbye!");
                        return;
                    default:
                        System.out.println("Invalid option. Please try again.");
                }
            } catch (NumberFormatException | IOException | InterruptedException e) {
                throw new InvalidInputException("Please enter a valid number");
            }
        }
    }

    private void searchByMessage() throws InterruptedException {
        System.out.print("Enter message to search(Enter to skip): ");
        String message = scanner.nextLine().toLowerCase();

        LogSearchCriteria logSearchCriteria = new LogSearchCriteria();
        logSearchCriteria.setMessage(message);
        res = logService.search(logSearchCriteria);
        logService.showLog(res);
    }

    private void searchByTimeRange() throws InterruptedException {
        System.out.print("Enter date time from(enter to skip): ");
        String dateTimeStartStr = scanner.nextLine();
        System.out.print("Enter date time to(enter to skip): ");
        String dateTimeEndStr = scanner.nextLine();

        LocalDateTime timeStart = (!dateTimeStartStr.isEmpty()) ? LocalDateTime.parse(dateTimeStartStr, FORMATTER) : null;
        LocalDateTime timeEnd = (!dateTimeEndStr.isEmpty()) ? LocalDateTime.parse(dateTimeEndStr, FORMATTER) : null;

        LogSearchCriteria criteria = new LogSearchCriteria();
        criteria.setStartTime(timeStart);
        criteria.setEndTime(timeEnd);

        res = logService.search(criteria);
        logService.showLog(res);
    }

    private void searchByLogLevel() throws InterruptedException {
        System.out.print("Enter log level(INFO, TRACE, WARN, ERROR, DEBUG): ");
        String logLevel = scanner.nextLine();

        LogSearchCriteria criteria = new LogSearchCriteria();
        criteria.setLogLevel(logLevel.isEmpty() ? null : LogLevelEnum.valueOf(logLevel));

        res = logService.search(criteria);
        logService.showLog(res);
    }


    private void viewAllLogs() {
        System.out.println("--All Logs View--");
        logService.showLog(logService.getAll());
    }

    private void advancedSearch() throws IOException, InterruptedException {
        System.out.print("Enter date time from(Enter to skip): ");
        String dateTimeStartStr = scanner.nextLine();

        System.out.print("Enter date time to(Enter to skip): ");
        String dateTimeEndStr = scanner.nextLine();

        LocalDateTime timeStart = (!dateTimeStartStr.isEmpty()) ? LocalDateTime.parse(dateTimeStartStr, FORMATTER) : null;
        LocalDateTime timeEnd = (!dateTimeEndStr.isEmpty()) ? LocalDateTime.parse(dateTimeEndStr, FORMATTER) : null;

        System.out.print("Enter log level(Enter to skip): ");
        String logLevel = scanner.nextLine().toUpperCase();

        System.out.print("Enter message to search(Enter to skip): ");
        String message = scanner.nextLine().toLowerCase();

        LogSearchCriteria criteria = new LogSearchCriteria.Builder()
                .startTime(timeStart)
                .endTime(timeEnd)
                .logLevel(logLevel.isEmpty() ? null : LogLevelEnum.valueOf(logLevel))
                .message(message)
                .build();

        res = logService.search(criteria);
        logService.showLog(res);
    }

    private void exportResults() {

    }

}
