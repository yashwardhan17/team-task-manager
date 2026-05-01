package com.taskmanager.service;

import com.taskmanager.dto.ProjectRequest;
import com.taskmanager.entity.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ActivityLogRepository activityLogRepository;

    public Project createProject(ProjectRequest request, User currentUser) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .build();

        project = projectRepository.save(project);

        // Auto-add creator as ADMIN member
        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(currentUser)
                .role(ProjectMember.ProjectRole.ADMIN)
                .build();
        projectMemberRepository.save(member);

        logActivity(project, currentUser, "created project \"" + project.getName() + "\"");
        return project;
    }

    public List<Project> getUserProjects(User currentUser) {
        List<Project> owned = projectRepository.findByOwner(currentUser);
        List<Project> member = projectRepository.findProjectsByMember(currentUser);

        return java.util.stream.Stream.concat(owned.stream(), member.stream())
                .distinct()
                .collect(Collectors.toList());
    }

    public Project getProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateMember(project, currentUser);
        return project;
    }

    public void addMember(Long projectId, Long userId, User currentUser,
                          UserRepository userRepository) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateAdmin(project, currentUser);

        User newMember = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (projectMemberRepository.existsByProjectIdAndUser(projectId, newMember)) {
            throw new RuntimeException("User already a member");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(newMember)
                .role(ProjectMember.ProjectRole.MEMBER)
                .build();
        projectMemberRepository.save(member);

        logActivity(project, currentUser, "added " + newMember.getName() + " to the project");
    }

    public List<ProjectMember> getMembers(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateMember(project, currentUser);
        return projectMemberRepository.findByProjectId(projectId);
    }

    private void validateMember(Project project, User user) {
        boolean isMember = projectMemberRepository
                .existsByProjectIdAndUser(project.getId(), user);
        if (!isMember) throw new RuntimeException("Access denied");
    }

    private void validateAdmin(Project project, User user) {
        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUser(project.getId(), user)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        if (member.getRole() != ProjectMember.ProjectRole.ADMIN) {
            throw new RuntimeException("Admin access required");
        }
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