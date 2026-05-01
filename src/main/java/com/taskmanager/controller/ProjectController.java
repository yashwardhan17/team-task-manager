package com.taskmanager.controller;

import com.taskmanager.dto.ProjectRequest;
import com.taskmanager.entity.*;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.ProjectService;
import com.taskmanager.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final TaskService taskService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody ProjectRequest request,
                                           @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.createProject(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<?> getMyProjects(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.getUserProjects(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id,
                                        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.getProject(id, currentUser));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable Long id,
                                       @RequestBody Map<String, Long> body,
                                       @AuthenticationPrincipal User currentUser) {
        projectService.addMember(id, body.get("userId"), currentUser, userRepository);
        return ResponseEntity.ok(Map.of("message", "Member added successfully"));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getMembers(@PathVariable Long id,
                                        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.getMembers(id, currentUser));
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<?> getDashboard(@PathVariable Long id,
                                          @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getDashboard(id, currentUser));
    }

    @GetMapping("/{id}/activity")
    public ResponseEntity<?> getActivity(@PathVariable Long id,
                                         @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.getProject(id, currentUser));
    }

    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(@RequestParam String email) {
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail()
                )))
                .orElse(ResponseEntity.ok(Map.of("error", "User not found")));
    }
}