package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignee(User assignee);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.deadline < :now AND t.status != 'DONE'")
    List<Task> findOverdueTasks(Long projectId, LocalDateTime now);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    List<Task> findByProjectIdAndStatus(Long projectId, Task.Status status);
}