package com.taskmanager.repository;

import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProjectId(Long projectId);
    Optional<ProjectMember> findByProjectIdAndUser(Long projectId, User user);
    boolean existsByProjectIdAndUser(Long projectId, User user);
}