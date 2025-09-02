package service.impl;

import config.AppConfig;
import dto.Log;
import exceptions.FileException;
import service.FileService;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class FileServiceImpl implements FileService {

    @Override
    public void exportFile(List<Log> logList) {
        String filePath = AppConfig.getExportPath();
        try(BufferedWriter bufferedWriter = new BufferedWriter(Files.newBufferedWriter(Path.of(filePath)))) {
            for(Log item: logList) {
                bufferedWriter.write(item.getFullLog());
                bufferedWriter.newLine();
            }
            System.out.println("Export successfully");
        } catch(IOException e) {
            throw new FileException("Error while export file");
        }
    }
}
