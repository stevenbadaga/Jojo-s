package com.kitenge.repository;

import com.kitenge.model.UserNotifications;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserNotificationsRepository extends JpaRepository<UserNotifications, Long> {
    Optional<UserNotifications> findByUserId(Long userId);
}
