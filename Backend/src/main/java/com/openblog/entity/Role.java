package com.openblog.entity;

/**
 * Application roles used for Role-Based Access Control (RBAC).
 * USER  - default role, can create/manage own content.
 * ADMIN - full moderation rights across users, posts and comments.
 */
public enum Role {
    USER,
    ADMIN
}
