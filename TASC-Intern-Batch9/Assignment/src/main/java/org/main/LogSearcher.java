package org.main;


import config.ThreadConfig;
import controller.LogController;

public class LogSearcher {
    public static void main(String[] args) {
        LogController logController = new LogController();
        logController.showMenu();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutting down executor...");
            ThreadConfig.getExecutorService().shutdown();
        }));
    }
}
