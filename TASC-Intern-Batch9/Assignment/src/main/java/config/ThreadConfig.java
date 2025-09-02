package config;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ThreadConfig {
    private static final int THREAD_POOL_SIZE = 10;

    private static final ExecutorService EXECUTOR_SERVICE =
            Executors.newFixedThreadPool(THREAD_POOL_SIZE);

    private ThreadConfig() {
    }

    public static ExecutorService getExecutorService() {
        return EXECUTOR_SERVICE;
    }

    public static int getThreadPoolSize() {
        return THREAD_POOL_SIZE;
    }
}
