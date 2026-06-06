# Setup & Testing Guide

## 🚀 Quick Start

### 1. Initialize Database Tables
```bash
cd g:\SkillSync-AI\backend
python -m app.db.init_db
```

### 2. Seed Initial Skills (Optional but Recommended)
```bash
python -m app.db.seed_skills
```

This will add 40+ common tech skills categorized as:
- Programming Languages (Python, JavaScript, etc.)
- Frontend (React, Vue, Next.js, etc.)
- Backend (FastAPI, Django, Node.js, etc.)
- Database (PostgreSQL, MongoDB, etc.)
- DevOps (Docker, Kubernetes, AWS, etc.)
- AI/ML (LangChain, TensorFlow, etc.)
- Tools (REST API, GraphQL, etc.)

### 3. Start the Server
```bash
python -m uvicorn app.main:app --reload
```

### 4. Open Swagger UI
Visit: http://localhost:8000/docs

---

## 🧪 Testing Flow (Step-by-Step)

### Step 1: Register a User
1. Find `POST /auth/register` endpoint
2. Click **Try it out**
3. Enter details:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```
4. Click **Execute**
5. Should get: `{"message": "User registered successfully"}`

### Step 2: Login
1. Find `POST /auth/login` endpoint
2. Click **Try it out**
3. Enter credentials:
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```
4. Click **Execute**
5. **Copy the `access_token`** from response

### Step 3: Authorize with Token
1. Click the **🔒 Authorize** button at the top
2. Paste the token in the value field
3. Click **Authorize**
4. Click **Close**

### Step 4: Create Profile
1. Find `POST /profile/` endpoint
2. Click **Try it out**
3. Enter profile data:
```json
{
  "bio": "CS student passionate about AI",
  "github_url": "https://github.com/johndoe",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "experience_level": "beginner",
  "target_role": "AI Engineer",
  "interests": ["Machine Learning", "NLP", "Computer Vision"]
}
```
4. Click **Execute**
5. Should get full profile response with ID

### Step 5: Get Your Profile
1. Find `GET /profile/me` endpoint
2. Click **Try it out**
3. Click **Execute**
4. Should see your profile data

### Step 6: Update Profile
1. Find `PUT /profile/` endpoint
2. Click **Try it out**
3. Update any fields:
```json
{
  "bio": "Updated bio - Now learning FastAPI!",
  "experience_level": "intermediate"
}
```
4. Click **Execute**

### Step 7: Get All Skills
1. Find `GET /skills/` endpoint
2. Click **Try it out**
3. Optional: Add search filter
   - `search`: "Python"
   - `category`: "Backend"
4. Click **Execute**
5. Should see list of skills

### Step 8: Add Skills to Profile
1. First, get a skill ID from `GET /skills/`
2. Find `POST /profile/skills` endpoint
3. Click **Try it out**
4. Enter:
```json
{
  "skill_id": "copy-skill-id-from-step-7",
  "proficiency_level": "intermediate"
}
```
5. Click **Execute**

### Step 9: View Profile with Skills
1. Find `GET /profile/me` endpoint
2. Click **Execute**
3. Should now see `skills` array in response!

### Step 10: Remove a Skill
1. Find `DELETE /profile/skills/{skill_id}` endpoint
2. Click **Try it out**
3. Enter the skill_id
4. Click **Execute**

---

## 📋 All Available Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Profile (Protected - requires token)
- `GET /profile/me` - Get current user profile
- `POST /profile/` - Create profile
- `PUT /profile/` - Update profile
- `POST /profile/skills` - Add skill to profile
- `DELETE /profile/skills/{skill_id}` - Remove skill from profile

### Skills (Public)
- `GET /skills/` - Get all skills (with optional search/filter)
- `GET /skills/{skill_id}` - Get specific skill
- `GET /skills/categories` - Get all skill categories
- `POST /skills/` - Create new skill (admin)

---

## 🐛 Troubleshooting

### Issue: "Profile not found"
**Solution**: Create a profile first using `POST /profile/`

### Issue: "Invalid token"
**Solution**: 
1. Login again to get fresh token
2. Make sure token is pasted correctly in Authorize
3. Token expires after 30 minutes

### Issue: "Skill already added"
**Solution**: You can't add the same skill twice. Use different skill or remove first.

### Issue: Database connection error
**Solution**: 
1. Make sure PostgreSQL is running
2. Check `.env` file has correct DATABASE_URL
3. Run `python -m app.db.init_db` to create tables

---

## 🎯 Next Steps After Testing

1. ✅ Resume Upload System
2. ✅ AI Recommendation Engine
3. ✅ Learning Roadmap Generator
4. ✅ AI Mentor Chat

---

## 💡 Pro Tips

- Use the seed script to populate skills quickly
- All profile endpoints require authentication
- Skills are shared across all users (master list)
- UserSkill connects profiles to skills with proficiency level
- Profile can have multiple skills (many-to-many relationship)
