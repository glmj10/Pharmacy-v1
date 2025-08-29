package org.demo;

import dto.Log;
import enums.LogLevelEnum;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Scanner;

public class Test {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");
    private List<Log> allLogs;
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        int firstOpenIndex = line.indexOf('[');
        int firstCloseIndex = line.indexOf(']');

        String firstElement = line.substring(firstOpenIndex + 1, firstCloseIndex);
        System.out.println(firstElement);
        LocalDateTime timeStamp = LocalDateTime.parse(firstElement, FORMATTER);

        int secondOpenIndex = line.indexOf('[', firstOpenIndex + 1);
        int secondCloseIndex = line.indexOf(']', secondOpenIndex + 1);
        String secondElement = line.substring(secondOpenIndex + 1, secondCloseIndex);
        System.out.println(secondElement);

        int thirdOpenIndex = line.indexOf('[', secondOpenIndex + 1);
        int thirdCloseIndex = line.indexOf(']', secondCloseIndex + 1);
        String thirdElement = line.substring(thirdOpenIndex + 1, thirdCloseIndex);
        System.out.println(thirdElement);

        int finalDash = line.indexOf("- ");
        String finalElement = line.substring(finalDash + 1).trim();
        System.out.println(finalElement);

        System.out.println(new Log(line, timeStamp, LogLevelEnum.valueOf(secondElement.toUpperCase()), thirdElement, finalElement));
    }


}
