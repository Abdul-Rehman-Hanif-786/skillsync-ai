Main Tables

users
profiles
skills
user_skills
recommendations
roadmaps
resumes
chat_history

Table Relationships
users

Stores authentication data.

profiles

Stores:

bio
interests
target role
experience level
skills

Master skills list.

Example:

Python
FastAPI
React
Docker
LangChain
user_skills

Many-to-many relation.

recommendations

Stores generated recommendations.

roadmaps

Stores personalized learning roadmap.

resumes

Stores uploaded CV metadata.