package exceptions;

public class LogParsingException extends LogSearchException{
    public LogParsingException(String message, String rawLogLine, Throwable cause) {
        super("Failed to parse log line: " + rawLogLine + " - " + message, cause);
    }


    public LogParsingException(String message, String rawLogLine) {
        super("Failed to parse log line: " + rawLogLine + " - " + message);
    }
}
