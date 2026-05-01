package com.taskmanager.service;

import com.taskmanager.dto.DashboardResponse;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.entity.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public Task createTask(Long projectId, TaskRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateMember(project, currentUser);

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .project(project)
                .assignee(assignee)
                .createdBy(currentUser)
                .priority(request.getPriority() != null ?
                        Task.Priority.valueOf(request.getPriority()) : Task.Priority.MEDIUM)
                .deadline(request.getDeadline())
                .build();

        task = taskRepository.save(task);

        String assigneeName = assignee != null ? assignee.getName() : "unassigned";
        logActivity(project, currentUser,
                "created task \"" + task.getTitle() + "\" assigned to " + assigneeName);

        return task;
    }

    public Task updateTask(Long taskId, TaskRequest request, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        validateMember(task.getProject(), currentUser);

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDeadline() != null) task.setDeadline(request.getDeadline());
        if (request.getPriority() != null)
            task.setPriority(Task.Priority.valueOf(request.getPriority()));

        if (request.getStatus() != null) {
            Task.Status oldStatus = task.getStatus();
            Task.Status newStatus = Task.Status.valueOf(request.getStatus());
            task.setStatus(newStatus);
            logActivity(task.getProject(), currentUser,
                    "moved \"" + task.getTitle() + "\" from " + oldStatus + " to " + newStatus);
        }

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
            logActivity(task.getProject(), currentUser,
                    "assigned \"" + task.getTitle() + "\" to " + assignee.getName());
        }

        return taskRepository.save(task);
    }

    public List<Task> getProjectTasks(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateMember(project, currentUser);
        return taskRepository.findByProjectId(projectId);
    }

    public void deleteTask(Long taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        validateMember(task.getProject(), currentUser);
        taskRepository.delete(task);
    }

    public DashboardResponse getDashboard(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateMember(project, currentUser);

        List<Task> allTasks = taskRepository.findByProjectId(projectId);
        List<Task> overdue = taskRepository.findOverdueTasks(projectId, LocalDateTime.now());
        List<ActivityLog> activity = activityLogRepository
                .findByProjectIdOrderByTimestampDesc(projectId);

        return DashboardResponse.builder()
                .totalTasks(allTasks.size())
                .todoCount(allTasks.stream()
                        .filter(t -> t.getStatus() == Task.Status.TODO).count())
                .inProgressCount(allTasks.stream()
                        .filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count())
                .inReviewCount(allTasks.stream()
                        .filter(t -> t.getStatus() == Task.Status.IN_REVIEW).count())
                .doneCount(allTasks.stream()
                        .filter(t -> t.getStatus() == Task.Status.DONE).count())
                .overdueCount(overdue.size())
                .recentActivity(activity)
                .build();
    }

    private void validateMember(Project project, User user) {
        boolean isMember = projectMemberRepository
                .existsByProjectIdAndUser(project.getId(), user);
        if (!isMember) throw new RuntimeException("Access denied");
    }

    private void logActivity(Project project, User user, String action) {
        ActivityLog log = ActivityLog.builder()
                .project(project)
                .user(user)
                .action(action)
                .build();
        activityLogRepository.save(log);
    }
}