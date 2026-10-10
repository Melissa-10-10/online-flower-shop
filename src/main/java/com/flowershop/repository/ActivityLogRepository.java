package com.flowershop.repository;

import com.flowershop.document.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findByPerformedByOrderByTimestampDesc(String username);
    List<ActivityLog> findByEntityTypeOrderByTimestampDesc(String entityType);
}
