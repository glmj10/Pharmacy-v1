package exceptions;

public class LogExportException extends LogSearchException{
    public LogExportException(String message) {
        super(message);
    }

    public LogExportException(String message, Throwable throwable) {
        super(message, throwable);
    }
}
