package config;

import java.time.format.DateTimeFormatter;

public class AppConfig {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");

    private static final String FILE_PATH = "logs.txt";
    private static final String EXPORT_PATH = "kq.txt";

    public static DateTimeFormatter getDateTimeFormatter() {
        return DATE_TIME_FORMATTER;
    }

    public static String getFilePath() {
        return FILE_PATH;
    }

    public static String getExportPath() {
        return EXPORT_PATH;
    }
}

