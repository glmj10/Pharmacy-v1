package org.example;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    public static void main(String[] args) {
        ExecutorService executorService = Executors.newFixedThreadPool(2);

        for (int i = 1; i <= 10; i++) {
            int taskId = i;
            executorService.execute(() -> {
                System.out.println("Task " + taskId + " running on " + Thread.currentThread().getName());
            });
        }

        if(executorService.isShutdown()) {
            System.out.println("shutdown");
        }

    }
}

class RunableThread implements Runnable {

    @Override
    public void run() {
        System.out.println("Thread a run");
    }
}