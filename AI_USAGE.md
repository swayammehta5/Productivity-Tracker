# AI_USAGE.md

## AI Tools Used

1. ChatGPT
2. GitHub Copilot

## Purpose of AI Usage

* Architecture planning
* API design guidance
* Database schema suggestions
* Debugging support
* Documentation generation

## Key Prompts Used

1. Generate MongoDB schema for a productivity tracking application.
2. Design REST APIs for task and habit management.
3. Suggest gamification mechanisms for productivity apps.
4. Create React component structure for MERN application.
5. Explain JWT and Google OAuth integration.

## AI Mistake #1

AI Suggestion:
Store passwords directly in MongoDB.

Issue Found:
Passwords must never be stored in plain text.

Correction:
Implemented bcrypt hashing before storing passwords.

---

## AI Mistake #2

AI Suggestion:
Store JWT tokens permanently without expiration.

Issue Found:
Security vulnerability.

Correction:
Implemented 7-day token expiration.

---

## AI Mistake #3

AI Suggestion:
Allow habit completion for any past date.

Issue Found:
Users could manipulate streak calculations.

Correction:
Restricted habit completion to current day only.

## Lessons Learned

AI accelerated development but every suggestion was manually reviewed, validated, and tested before implementation.
