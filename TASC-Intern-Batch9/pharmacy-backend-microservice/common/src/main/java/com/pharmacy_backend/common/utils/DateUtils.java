package com.pharmacy_backend.common.utils;

import java.time.LocalDateTime;
import java.util.Date;

public class DateUtils {

    public static LocalDateTime convertToLocalDateTime(String dateTimeString) {
        return LocalDateTime.parse(dateTimeString);
    }

    public static LocalDateTime convertToLocalDateTime(Date date) {
        return LocalDateTime.ofInstant(date.toInstant(), java.time.ZoneId.systemDefault());
    }
}
