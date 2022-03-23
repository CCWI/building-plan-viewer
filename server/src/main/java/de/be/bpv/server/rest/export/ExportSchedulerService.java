package de.be.bpv.server.rest.export;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

@Service
public class ExportSchedulerService {

    private Map<Path, ScheduledFuture> futures = new HashMap<>();

    private ScheduledExecutorService executor = Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors());

    private Logger logger;

    private static final TimeUnit UNITS = TimeUnit.MINUTES; // your time unit

    public void scheduleForDeletion(Path path, long delay) {
        ScheduledFuture future = executor.schedule(() -> {
            try {
                Files.delete(path);
                logger.info("file on path:" + path.toString() + "was deleted");
            } catch (IOException e) {
                logger.warning("file on path:" + path.toString() + "was deleted");
                // failed to delete
            }
        }, delay, UNITS);

        futures.put(path, future);
    }

    public void onFileAccess(Path path) {
        ScheduledFuture future = futures.get(path);
        if (future != null) {

            boolean result = future.cancel(false);
            if (result) {
                // reschedule the task
                futures.remove(path);
                scheduleForDeletion(path, future.getDelay(UNITS));
            } else {
                // too late, task was already running
            }
        }
    }
}