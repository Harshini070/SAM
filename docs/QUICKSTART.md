# Backend Setup & Quick Start Guide

## 🚀 Quick Start (3 minutes)

### Option 1: Docker (Recommended)

```bash
# 1. Make sure Docker is installed
docker --version
docker-compose --version

# 2. Start everything
cd backend
docker-compose up -d

# 3. Wait for services to start (30 seconds)
docker-compose logs -f

# 4. Seed sample data
docker-compose exec backend python seed_db.py

# 5. Access
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Mongo Express (DB UI): http://localhost:8081
```

### Option 2: Local Setup

```bash
# 1. Install MongoDB
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# 2. Start MongoDB
mongod  # In separate terminal

# 3. Install Python dependencies
cd backend
pip install -r requirements.txt

# 4. Setup .env
cp .env.example .env
# Edit .env and set MONGODB_URL to mongodb://localhost:27017

# 5. Seed sample data
python seed_db.py

# 6. Start backend
python -m uvicorn main:app --reload

# Backend API: http://localhost:8000
```

---

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## 🔐 Test Login Credentials

After seeding, use these to test:

| Role | Phone | Password | Notes |
|------|-------|----------|-------|
| Parent | 9876543210 | N/A (OTP login) | Use for testing parent portal |
| Mitanin | 9876543215 | N/A | Frontline worker |
| Anganwadi | 9876543216 | N/A | Center staff |
| PHC | 9876543217 | N/A | Primary health center |
| NRC | 9876543218 | N/A | Nutrition rehabilitation center |
| District | 9876543219 | N/A | District officer |
| State Admin | 9876543220 | N/A | State government |

**Parent OTP Login Flow:**
```bash
# 1. Request OTP
curl -X POST http://localhost:8000/api/auth/parent/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Check logs for OTP (printed in console during development)
# OTP for 9876543210: 123456

# 2. Verify OTP
curl -X POST http://localhost:8000/api/auth/parent/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "code": "123456"}'

# Returns: { "access_token": "...", "refresh_token": "..." }

# 3. Use token for authenticated requests
curl -X GET http://localhost:8000/api/children/by-mother/9876543210 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🧪 Test Sample Requests

### 1. Get Dashboard Analytics
```bash
curl http://localhost:8000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "total_children": 5,
  "healthy_children": 1,
  "mam_children": 2,
  "sam_children": 2,
  "recovery_percentage": 25.5,
  "pending_followups": 2,
  "high_risk_children": 2
}
```

### 2. Register a New Child
```bash
curl -X POST http://localhost:8000/api/children/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Child",
    "dob": "2021-05-15T00:00:00Z",
    "gender": "M",
    "mother_name": "Mother Name",
    "mother_phone": "9876543210",
    "village": "Sample Village",
    "district": "Raipur",
    "weight": 12.5,
    "height": 85,
    "muac": 12.5
  }'
```

### 3. Screen a Child (Mitanin Workflow)
```bash
curl -X POST http://localhost:8000/api/children/screen \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "child_id": "CHILD_001",
    "weight": 12.5,
    "height": 85,
    "muac": 12.5,
    "age_months": 42
  }'
```

Response (SAM Case):
```json
{
  "child_id": "CHILD_001",
  "bmi": 17.2,
  "status": "sam",
  "risk_level": "CRITICAL",
  "recommendation": "Immediate NRC referral required",
  "next_followup_date": "2024-05-25T00:00:00Z"
}
```

### 4. Find Nearest NRC (with Available Beds)
```bash
curl "http://localhost:8000/api/nrc/nearest?latitude=21.2458&longitude=81.6304" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Get All NRC Centers
```bash
curl "http://localhost:8000/api/nrc/centers?district=Raipur" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Check NRC Occupancy
```bash
curl http://localhost:8000/api/nrc/centers/NRC_RAIPUR_01/occupancy \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "nrc_id": "NRC_RAIPUR_01",
  "total_beds": 120,
  "occupied_beds": 85,
  "available_beds": 35,
  "occupancy_percentage": 70.83
}
```

### 7. District Analytics
```bash
curl http://localhost:8000/api/analytics/district/Raipur \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. State-Level Analytics (State Admin Only)
```bash
curl http://localhost:8000/api/analytics/state \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🗄️ MongoDB Data Exploration

### Using Mongo Express (GUI)
Visit: http://localhost:8081

### Using MongoDB CLI
```bash
# Connect to MongoDB
mongosh "mongodb://admin:password123@localhost:27017/chhattisgarh_nutrition"

# List collections
show collections

# View children
db.children.find()

# View NRC centers
db.nrc_centers.find()

# Count SAM cases
db.children.countDocuments({ "health_status": "sam" })

# View transactions (blockchain)
db.transactions.find().sort({ created_at: -1 }).limit(10)
```

---

## 📝 Logs & Debugging

### View All Logs
```bash
# Docker
docker-compose logs -f

# Docker (backend only)
docker-compose logs -f backend

# Local development
# Check console output where you ran uvicorn
```

### Common Issues

**Issue: MongoDB connection refused**
```
❌ Error: [Errno 111] Connection refused
```
**Solution:**
- Ensure MongoDB is running: `mongod`
- Or use Docker: `docker-compose up -d mongodb`
- Check connection string in `.env`

**Issue: Port 8000 already in use**
```
❌ ERROR: bind: address already in use
```
**Solution:**
```bash
# Find process using port
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
uvicorn main:app --port 8001
```

**Issue: OTP not being sent**
```
⚠️ OTP sending failed
```
**Solution:**
- Development: OTP is printed in console logs
- Production: Setup Twilio credentials in `.env`
```ini
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🚀 Deployment Preparation

### Before Deploying to Production

1. **Update Secrets**
   ```bash
   # Generate new SECRET_KEY
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   
   # Update .env
   SECRET_KEY=<new-secret>
   ```

2. **Setup MongoDB Atlas**
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create cluster
   - Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/db`
   - Update `.env`: `MONGODB_URL=<your-atlas-connection-string>`

3. **Setup Twilio (SMS)**
   - Create account at https://www.twilio.com
   - Get Account SID, Auth Token, Phone Number
   - Update `.env`

4. **Configure CORS**
   ```python
   # In main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com"],  # Specific domain
       allow_credentials=True,
       allow_methods=["GET", "POST", "PUT"],
       allow_headers=["*"],
   )
   ```

5. **Enable Logging**
   ```python
   # Add logging configuration
   import logging
   logging.basicConfig(level=logging.INFO)
   ```

6. **Deploy**
   ```bash
   # Option 1: Heroku
   git push heroku main
   
   # Option 2: AWS/GCP/Azure
   # Use docker image from Dockerfile
   docker build -t chhattisgarh-nutrition .
   docker push <registry>/chhattisgarh-nutrition
   
   # Option 3: Using gunicorn (production WSGI)
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

---

## 📊 Performance Monitoring

### Add Prometheus Metrics
```bash
pip install prometheus-client
```

### Add NewRelic Monitoring
```bash
pip install newrelic
newrelic-admin generate-config <LICENSE_KEY> newrelic.ini
newrelic-admin run-program uvicorn main:app
```

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Test API: http://localhost:8000/docs
3. Check MongoDB: http://localhost:8081
4. Read: [ARCHITECTURE.md](./ARCHITECTURE.md)
5. Read: [README.md](./README.md)

---

**Ready for testing! 🎉**
