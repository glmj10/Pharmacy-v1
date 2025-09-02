package org.demo;

import dto.Log;
import enums.LogLevelEnum;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class LogSearcher {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");
    private static final String LOG_FILE_PATH = "logs.txt";

    private List<Log> result = new ArrayList<>();
    private final Scanner scanner;
    private final List<Path> chunkfiles;

    public LogSearcher() throws IOException {
        this.scanner = new Scanner(System.in);
        this.chunkfiles = splitFile(LOG_FILE_PATH, 50000);
    }

    public static void main(String[] args) throws IOException {
        LogSearcher searcher = new LogSearcher();
        searcher.showMenu();
    }

    private List<Path> splitFile(String inputFile, int linePerChunk) {
        List<Path> chunkFiles = new ArrayList<>();

        try(BufferedReader reader = Files.newBufferedReader(Path.of(inputFile))) {
            int cnt = 0;
            int fileIndex = 0;
            Path chunkFile = createChunkFile(fileIndex);
            BufferedWriter writer = Files.newBufferedWriter(chunkFile);
            chunkFiles.add(chunkFile);

            String line;
            while ((line = reader.readLine()) != null) {
                writer.write(line);
                writer.newLine();
                cnt++;

                if(cnt >= linePerChunk) {
                    writer.close();
                    fileIndex++;
                    chunkFile = createChunkFile(fileIndex);
                    writer = Files.newBufferedWriter(chunkFile);
                    chunkFiles.add(chunkFile);
                    cnt = 0;
                }
            }
            writer.close();
            return chunkFiles;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Path createChunkFile(int fileIndex) throws IOException {
        Path path = Path.of("chunk_" + fileIndex + ".log");
        if (Files.exists(path)) {
            Files.delete(path);
        }
        return Files.createFile(path);
    }

    private void processChunksAndPrint(List<Path> chunkFiles,
                                       LocalDateTime timeStart, LocalDateTime timeEnd,
                                       LogLevelEnum level, String message) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());

        for (Path chunk : chunkFiles) {
            executor.submit(() -> {
                try (BufferedReader reader = Files.newBufferedReader(chunk)) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        Log log = parseLogLine(line);
                        if ((timeStart == null || !log.getDateTime().isBefore(timeStart)) &&
                                (timeEnd == null || !log.getDateTime().isAfter(timeEnd)) &&
                                (level == null || log.getLevel().equals(level)) &&
                                (message == null || log.getMessage().toLowerCase().contains(message.toLowerCase()))) {
                            synchronized (System.out) {
                                System.out.println(log.getFullLog());
                            }
                        }
                    }
                }
                return null;
            });
        }

        executor.shutdown();
        executor.awaitTermination(1, TimeUnit.HOURS);
    }


    private Log parseLogLine(String line) {
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
    }

    private void showMenu() {
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
                System.out.println("Please enter a valid number.");
            }
        }
    }

    private void exportResults() throws IOException {
        String filePath = "kq.txt";
        try(BufferedWriter bufferedWriter = new BufferedWriter(Files.newBufferedWriter(Path.of(filePath)))) {
            for(Log item: result) {
                bufferedWriter.write(item.getFullLog());
                bufferedWriter.newLine();
            }
            System.out.println("Export successfully");
        } catch(IOException e) {
            e.printStackTrace();
        }
    }

    private void viewAllLogs() {
        System.out.println("--All Logs View--");
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

        processChunksAndPrint(chunkfiles, timeStart, timeEnd, (logLevel.isEmpty()) ? null: LogLevelEnum.valueOf(logLevel), message);
    }

    private void searchByMessage() throws InterruptedException {
        System.out.print("Enter message to search(Enter to skip): ");
        String message = scanner.nextLine().toLowerCase();
        processChunksAndPrint(chunkfiles, null, null, null, message);

    }

    private void searchByTimeRange() throws InterruptedException {
        System.out.print("Enter date time from(enter to skip): ");
        String dateTimeStartStr = scanner.nextLine();
        System.out.print("Enter date time to(enter to skip): ");
        String dateTimeEndStr = scanner.nextLine();
        LocalDateTime timeStart = (!dateTimeStartStr.isEmpty()) ? LocalDateTime.parse(dateTimeStartStr, FORMATTER) : null;
        LocalDateTime timeEnd = (!dateTimeEndStr.isEmpty()) ? LocalDateTime.parse(dateTimeEndStr, FORMATTER) : null;

        processChunksAndPrint(chunkfiles,  timeStart, timeEnd, null, null);

    }

    private void searchByLogLevel() throws InterruptedException {
        System.out.print("Enter log level(INFO, TRACE, WARN, ERROR, DEBUG): ");
        String logLevel = scanner.next();
        processChunksAndPrint(chunkfiles, null, null, (logLevel.isEmpty()) ? null: LogLevelEnum.valueOf(logLevel), null);

    }

}
