package exceptions;

public class InvalidInputException extends LogSearchException {

    public InvalidInputException(String message) {
        super(message);
    }

    public InvalidInputException(String message, Throwable throwable) {
        super(message, throwable);
    }
}
