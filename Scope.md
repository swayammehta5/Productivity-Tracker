# SCOPE.md

## Project Scope

The Productivity Tracker application is designed to help users manage daily productivity through task tracking, habit monitoring, analytics, and gamification.

## Database Schema

### Users Collection

| Field          | Type     |
| -------------- | -------- |
| _id            | ObjectId |
| name           | String   |
| email          | String   |
| password       | String   |
| googleId       | String   |
| theme          | String   |
| emailReminders | Boolean  |

### Tasks Collection

| Field       | Type     |
| ----------- | -------- |
| _id         | ObjectId |
| userId      | ObjectId |
| title       | String   |
| description | String   |
| dueDate     | Date     |
| priority    | String   |
| status      | String   |
| category    | String   |

### Habits Collection

| Field         | Type     |
| ------------- | -------- |
| _id           | ObjectId |
| user          | ObjectId |
| name          | String   |
| frequency     | String   |
| goal          | Number   |
| currentStreak | Number   |
| longestStreak | Number   |

### UserScores Collection

| Field        | Type     |
| ------------ | -------- |
| _id          | ObjectId |
| user         | ObjectId |
| totalXP      | Number   |
| currentLevel | Number   |
| badges       | Array    |

## Data Validation Rules

* Empty task titles are rejected.
* Invalid email addresses are rejected.
* Duplicate user emails are not allowed.
* Habit goals must be positive.
* JWT authentication required for protected APIs.

## Anomaly Log

| Anomaly            | Handling             |
| ------------------ | -------------------- |
| Missing Task Title | Request Rejected     |
| Invalid Email      | Validation Error     |
| Duplicate Email    | Registration Blocked |
| Empty Habit Name   | Request Rejected     |
| Invalid JWT        | Access Denied        |
