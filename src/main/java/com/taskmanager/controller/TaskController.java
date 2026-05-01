package com.taskmanager.controller;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.entity.User;
import com.taskmanager.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<?> createTask(@PathVariable Long projectId,
                                        @RequestBody TaskRequest request,
                                        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.createTask(projectId, request, currentUser));
    }

    @GetMapping
    public ResponseEntity<?> getTasks(@PathVariable Long projectId,
                                      @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getProjectTasks(projectId, currentUser));
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable Long projectId,
                                        @PathVariable Long taskId,
                                        @RequestBody TaskRequest request,
                                        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.updateTask(taskId, request, currentUser));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable Long projectId,
                                        @PathVariable Long taskId,
                                        @AuthenticationPrincipal User currentUser) {
        taskService.deleteTask(taskId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Task deleted"));
    }
}