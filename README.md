# Chhattisgarh Child Nutrition Digital Infrastructure - Backend

FastAPI-based backend serving all 7 stakeholder portals.

## 📁 Project Structure

```
backend/
├── app/
│   ├── models/          # Data models
│   ├── routes/          # API endpoints
│   ├── schemas/         # Request/Response validation (Pydantic)
│   ├── services/        # Business logic
│   ├── middleware/      # Authentication & middleware
│   ├── utils/           # Helper functions
│   ├── config.py        # Configuration
│   ├── database.py      # MongoDB connection
│   └── __init__.py
├── main.py              # FastAPI app entry point
├── requirements.txt     # Dependencies
├── .env.example         # Environment template
├── start.sh             # Linux/Mac startup
└── start.bat            # Windows startup
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup MongoDB
- Local: `mongod`
- Or use MongoDB Atlas cloud: Update `MONGODB_URL` in `.env`

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Run Backend
```bash
# Linux/Mac
./start.sh

# Windows
start.bat

# Or directly
uvicorn main:app --reload
```

Server runs at: `http://localhost:8000`

## 📚 API Endpoints

### Authentication (Parent Portal)
- `POST /api/auth/parent/request-otp` - Request OTP
- `POST /api/auth/parent/verify-otp` - Verify OTP & Login
- `GET /api/auth/me` - Get current user

### Children Management (All Portals)
- `POST /api/children/register` - Register child
- `POST /api/children/screen` - Screen child & predict status
- `GET /api/children/{child_id}` - Get child details
- `GET /api/children/by-mother/{phone}` - Get parent's children
- `GET /api/children/by-district/{district}` - Get district children
- `GET /api/children/high-risk/list` - Get SAM cases
- `GET /api/children/pending-followups/list` - Get pending followups

### NRC Management (NRC Portal)
- `GET /api/nrc/centers` - Get NRC centers
- `GET /api/nrc/centers/{nrc_id}` - Get center details
- `GET /api/nrc/centers/{nrc_id}/occupancy` - Get bed occupancy
- `POST /api/nrc/admit` - Admit child
- `PUT /api/nrc/admissions/{admission_id}` - Update admission
- `GET /api/nrc/nearest` - Find nearest available NRC

### Blockchain & Transactions (All Portals)
- `GET /api/transactions/{nrc_id}` - Get transactions
- `GET /api/transactions/{transaction_id}/verify` - Verify transaction
- `GET /api/transactions/{nrc_id}/chain/verify` - Verify chain integrity
- `GET /api/transactions/{nrc_id}/summary` - Get summary

### Analytics & Reports (Admin Portals)
- `GET /api/analytics/dashboard` - Get dashboard stats
- `GET /api/analytics/district/{district}` - Get district stats
- `GET /api/analytics/state` - Get state-level stats
- `GET /api/analytics/nrc/{nrc_id}/performance` - Get NRC performance

## 🔒 Authentication

### Parent Login Flow (OTP-based)
```
1. POST /api/auth/parent/request-otp { "phone": "9876543210" }
2. Parent receives OTP via SMS
3. POST /api/auth/parent/verify-otp { "phone": "9876543210", "code": "123456" }
4. Returns: { "access_token": "...", "refresh_token": "..." }
5. Use token in header: Authorization: Bearer <token>
```

### Other Stakeholders (JWT)
- Created via admin dashboard
- Phone + password authentication
- Same JWT token flow

## 🗄️ Database (MongoDB)

Collections:
- `users` - All users (parents, mitanin, etc.)
- `children` - Child records with health status
- `nrc_centers` - NRC center information
- `admissions` - NRC admissions & treatment
- `transactions` - Blockchain transactions
- `otps` - OTP storage (auto-expires)
- `funds` - Budget allocation & spending

## 🔐 Security Features

- JWT token-based authentication
- OTP verification for parents (no password)
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Token expiration (30 mins access, 7 days refresh)
- CORS protection
- Rate limiting (to be added)

## 📊 Key Services

### AuthService
- OTP generation & verification
- User registration/login
- Token management

### ChildService
- Child registration
- Health screening
- SAM prediction
- Followup tracking

### NRCService
- Center management
- Admission/discharge
- Bed occupancy tracking
- Nearest center finder

### BlockchainService
- Transaction logging
- SHA256-based verification
- Chain integrity checking
- Supply chain tracking

## 🚀 Deployment

### Production Setup
1. Use MongoDB Atlas
2. Setup environment variables
3. Use gunicorn instead of uvicorn:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```
4. Deploy to: AWS/GCP/Azure/Heroku

### Docker (Optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

## 📝 Environment Variables

See `.env.example` for all available settings.

## 🤝 Integration Points

### Frontend Integration
```javascript
// Example React Native call
const response = await fetch('http://localhost:8000/api/children/register', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'Child Name',
        dob: '2020-01-15T00:00:00Z',
        // ...
    })
});
```

## 📱 Mobile App Integration

The backend is ready to serve:
- React Native mobile app
- Desktop GUI
- Web portals
- IoT devices

## 🛠️ Development

### Add New Endpoint
1. Create schema in `schemas/requests.py`
2. Create service method in `services/`
3. Create route in `routes/`
4. Include router in `main.py`

### Run Tests
```bash
pytest tests/
```

## 🆘 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify firewall settings

### Token Expired
- Refresh token using `/api/auth/refresh`
- Re-login if needed

### Permission Denied
- Check user role in token
- Ensure endpoint requires correct role

## 📞 Support

For issues or questions, check logs:
```bash
tail -f logs/app.log
```

---

**Built for Chhattisgarh Government** 🇮🇳
