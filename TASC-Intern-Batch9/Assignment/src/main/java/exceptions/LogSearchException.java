package exceptions;

public class LogSearchException extends RuntimeException{

    public LogSearchException(String message) {
        super(message);
    }

    public LogSearchException(String message, Throwable throwable) {
        super(message, throwable);
    }
}
