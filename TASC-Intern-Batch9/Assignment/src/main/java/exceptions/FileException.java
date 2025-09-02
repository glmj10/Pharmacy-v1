package exceptions;

public class FileException extends LogSearchException{
    public FileException(String message) {
        super(message);
    }

    public FileException(String message, Throwable throwable) {
        super(message, throwable);
    }
}
