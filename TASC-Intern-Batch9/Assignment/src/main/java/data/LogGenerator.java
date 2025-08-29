package data;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import java.util.concurrent.TimeUnit;

public class LogGenerator {

    private static final String[] LOG_LEVELS = {"INFO", "WARN", "ERROR", "DEBUG", "TRACE"};
    private static final String[] SERVICES = {
            "UserService", "ProductService", "OrderProcessor", "PaymentGateway",
            "NotificationManager", "DatabaseConnector", "AuthService", "Logger",
            "ReportGenerator", "CacheManager", "InventoryService", "ShippingService",
            "EmailSender", "QueueListener", "ConfigLoader"
    };
    private static final String[] BASE_MESSAGES = {
            "Request received successfully.",
            "User logged in.",
            "Failed to connect to external API.",
            "Data validation error.",
            "Item added to cart.",
            "Database query executed in 15ms.",
            "Configuration reloaded.",
            "Processing data batch.",
            "Authentication failed for user.",
            "Resource not found.",
            "Payment processed.",
            "Sending email notification.",
            "Service started.",
            "Memory usage high.",
            "Disk space low."
    };

    private static final Random RANDOM = new Random();
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");

    public static void main(String[] args) {
        generateFakeLogs(500000, "logs.txt");
    }

    public static void generateFakeLogs(int numLines, String filename) {
        System.out.println("Generating " + numLines + " fake log lines to '" + filename + "'...");

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            for (int i = 0; i < numLines; i++) {
                String logLine = generateSingleLogLine();
                writer.write(logLine);
                writer.newLine(); // Add a new line character
            }
            System.out.println("Successfully generated " + numLines + " log lines.");
        } catch (IOException e) {
            System.err.println("Error writing logs to file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static String generateSingleLogLine() {
        LocalDateTime timestamp = getRandomTimestampInLastYear();
        String level = getRandomElement(LOG_LEVELS);
        String service = getRandomElement(SERVICES);
        String message = getRandomMessageForLevel(level, service);

        return String.format("[%s] [%s] [%s]- %s",
                timestamp.format(FORMATTER),
                level,
                service,
                message);
    }

    private static LocalDateTime getRandomTimestampInLastYear() {
        LocalDateTime now = LocalDateTime.now();
        // Generate a random number of seconds within the last year
        long secondsInYear = TimeUnit.DAYS.toSeconds(365);
        long randomSeconds = (long) (RANDOM.nextDouble() * secondsInYear);
        return now.minusSeconds(randomSeconds);
    }

    private static String getRandomElement(String[] array) {
        return array[RANDOM.nextInt(array.length)];
    }

    private static String getRandomMessageForLevel(String level, String service) {
        String baseMessage = getRandomElement(BASE_MESSAGES);
        switch (level) {
            case "ERROR":
                return String.format("Critical error in %s: %s", service, getRandomElement(new String[]{
                        "NullPointerException", "Database connection lost", "API timeout", "Unauthorized access"
                }));
            case "WARN":
                return String.format("Warning in %s: %s", service, getRandomElement(new String[]{
                        "Low disk space", "Deprecated function call", "Unresponsive external service"
                }));
            case "INFO":
                return String.format("Processing request for user %d.", RANDOM.nextInt(9000) + 1000); // User ID between 1000 and 9999
            case "DEBUG":
                return String.format("Debug info for %s: Variable 'x' has value %d.", service, RANDOM.nextInt(101));
            default:
                return baseMessage;
        }
    }
}
