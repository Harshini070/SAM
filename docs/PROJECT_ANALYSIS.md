# SAM (Severe Acute Malnutrition) Detection System - Project Analysis

## Executive Summary

This is a **dual-stack project** combining:
- **Python backend**: AI/ML prediction system for SAM detection with desktop GUI
- **React Native frontend**: Mobile government e-governance portal for Chhattisgarh NRC (Nutrition Rehabilitation Centers)

The system is designed to track, detect, and manage severe acute malnutrition in children across 33 districts with 142+ NRC centers.

---

## 📊 CURRENT IMPLEMENTATION STATUS

### ✅ COMPLETED / WORKING

#### Python Backend (Desktop SAM Detection)
- ✅ **Blockchain implementation** (`blockchain.py`): Basic SHA256-based immutable ledger for transaction tracking
- ✅ **BMI-based SAM prediction** (`prediction.py`): Functional model that calculates:
  - BMI classification (Severe Acute Malnutrition < 14 BMI, Moderate 14-18, Healthy > 18)
  - Risk categorization (Age < 5 as high-risk multiplier)
  - WHO Z-score estimation
- ✅ **Data preprocessing** (`preprocessing.py`): Normalization functions for height/weight
- ✅ **Recommendation engine** (`recommendation.py`): Rule-based suggestions based on classification
- ✅ **Desktop GUI** (`gui.py`): CustomTkinter-based dashboard with:
  - Child profile management (name, age, gender)
  - Live sensor data display (8 anthropometric measurements: height, weight, BMI, head circumference, waist length, knee height, arm length, MUAC)
  - Real-time prediction with color-coded status (green/yellow/red)
  - Report generation & CSV export (`sam_reports.csv`)
  - Status indicators and sensor monitoring UI

#### React Native Frontend (e-Governance Portal)
- ✅ **Navigation structure** fully implemented:
  - Stack navigator: Splash → Login → MainTabs
  - Bottom tab navigation: Dashboard, Children, NRC Centers, Funds, Profile
  - Screen routing for ChildRegistration, Reports
- ✅ **Authentication screen** (`LoginScreen.tsx`): UI for user credentials with OTP fallback option
- ✅ **Dashboard** (`DashboardScreen.tsx`): 
  - Statistics display (12,483 SAM children, 71.6% recovery rate, 142 active NRCs)
  - Quick actions grid (8 action buttons)
  - Recent alerts system
  - Fund utilization by district (₹2.4 Crore budget)
  - Responsive layout with gradient headers
- ✅ **Child Management**:
  - `ChildrenListScreen.tsx`: Registry of 6 sample children with filtering, search, status badges
  - `ChildRegistrationScreen.tsx`: Form for registering new children with validation
  - Tracks: child name, DOB, gender, health status, anthropometric data, district
- ✅ **NRC Center Management** (`NRCCentersScreen.tsx`):
  - 5 NRC centers listed with real-time bed occupancy tracking
  - Summary stats (142 total centers, occupancy rates, bed capacity)
  - District filtering, status indicators
- ✅ **Fund Management** (`FundManagementScreen.tsx`):
  - Budget allocation display (₹2.40 Cr allocated, ₹1.62 Cr utilized = 67.5%)
  - Category breakdown: Therapeutic Foods, Medical Supplies, Staff, Operations, Emergency
  - Transaction history with approval status
- ✅ **Reports Screen** (`ReportsScreen.tsx`):
  - Recovery rate trends (Jan-Jun 2025: 58% → 71.6%)
  - Top district performance rankings
  - Nutritional status distribution (SAM, MAM, Normal)
  - Fund expenditure charts
- ✅ **Profile Management** (`ProfileScreen.tsx`):
  - User profile display (State Administrator)
  - Account settings and preferences
  - Logout functionality with confirmation

### ⚠️ PARTIALLY COMPLETED

- **Database**: No backend database exists yet (mock data in React screens)
- **Authentication**: Login UI exists but no actual credential validation/token system
- **Backend API**: No REST API or server to connect mobile app to Python backend
- **ML Model Integration**: Prediction logic is rule-based, not trained ML model; not integrated with mobile app
- **Blockchain**: Basic implementation but not integrated with any system; only test script (`transaction_test.py`)

### ❌ NOT STARTED / TODO

- Real backend server (Flask/Django/FastAPI)
- PostgreSQL/MongoDB database with schema
- User authentication system (JWT tokens, roles: Admin, Officer, Supervisor)
- API endpoints connecting frontend to predictions
- Sensor integration (Raspberry Pi camera, ultrasonic sensors, load cells mentioned in GUI)
- Real ML model training (currently rule-based only)
- Blockchain actual integration for transaction immutability
- MUAC (Mid-Upper Arm Circumference) scanning capability
- Push notifications system (4 pending notifications shown)
- Offline-first mobile data sync
- Role-based access control for different user types

---

## 🏗️ TECH STACK

### Backend/Desktop
| Component | Technology | Status |
|-----------|-----------|--------|
| Language | Python 3 | ✅ |
| Desktop GUI | CustomTkinter | ✅ |
| Blockchain | SHA256 Hash | ✅ |
| Prediction Engine | Rule-based (BMI) | ✅ |
| Data Export | CSV | ✅ |
| Hardware Interface | Not integrated | ❌ |

### Frontend/Mobile
| Component | Technology | Status |
|-----------|-----------|--------|
| Framework | React Native (Expo) | ✅ |
| Language | TypeScript | ✅ |
| Navigation | React Navigation v7 | ✅ |
| Styling | StyleSheet | ✅ |
| Charts | react-native-chart-kit (LineChart) | ✅ |
| Icons | Ionicons (Expo Vector Icons) | ✅ |
| UI Components | Custom components | ✅ |
| State Management | React Hooks | ✅ |
| Build System | Expo | ✅ |

### Missing Stack Elements
- **Backend**: Flask/Django/FastAPI server
- **Database**: PostgreSQL/MongoDB
- **ORM/ODM**: SQLAlchemy/Mongoose
- **Authentication**: JWT, OAuth2, or similar
- **Real ML**: TensorFlow/Scikit-learn trained model
- **API**: REST or GraphQL

---

## 📐 ARCHITECTURE & DATA FLOW

### Current Architecture (Disconnected)

```
┌─────────────────────┐         ┌──────────────────────┐
│   PYTHON BACKEND    │         │  REACT NATIVE MOBILE │
│   (Desktop Only)    │         │    (Mock Data Only)  │
│                     │         │                      │
│ • gui.py (TkGUI)    │         │ • Navigation Stack   │
│ • prediction.py     │         │ • 5 Tab Screens      │
│ • preprocessing.py  │         │ • 4 Form Screens     │
│ • recommendation.py │         │ • Chart Components   │
│ • blockchain.py     │         │ • Status Indicators  │
│ • sam_reports.csv   │         │ • Mock Data (JSON)   │
│                     │         │                      │
│ ❌ NO DATABASE      │         │ ❌ NO API CLIENT    │
│ ❌ NO SERVER        │         │ ❌ NO AUTH          │
└─────────────────────┘         └──────────────────────┘
        ↓ (ISOLATED)                     ↓ (ISOLATED)
    CSV File Export                 Local State Only
```

### Data Models (Implied)

#### Child Record
```typescript
{
  id: string,
  childName: string,
  dob: string,              // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Others',
  motherName: string,
  mobile: string,
  weight: number,           // kg
  height: number,           // cm
  healthStatus: 'SAM' | 'MAM' | 'Normal' | 'Under Observation',
  district: string,
  anganwadiCode: string,
  nrcId?: string,
  admitted?: Date,
  
  // Calculated fields
  bmi: number,
  muac: number,             // MUAC (Mid-Upper Arm Circumference)
  riskLevel: 'High' | 'Moderate' | 'Low',
  whozScore: number,        // WHO Z-score
  recoveryStatus: 'SAM' | 'Recovery' | 'Discharged'
}
```

#### NRC Center Record
```typescript
{
  id: string,
  name: string,
  district: string,
  totalBeds: number,
  occupiedBeds: number,
  staff: {
    count: number,
    incharge: string,
    phone: string
  },
  status: 'Active' | 'Maintenance',
  childrenAdmitted: string[]  // references to child IDs
}
```

#### Fund Record
```typescript
{
  id: string,
  category: 'Therapeutic Foods' | 'Medical Supplies' | 'Staff Allowances' | 'Operational Costs' | 'Emergency Fund',
  allocated: number,        // in rupees
  utilized: number,         // in rupees
  transactionHistory: Transaction[]
}
```

#### Transaction Record
```typescript
{
  id: string,
  centerId: string,
  description: string,
  amount: number,
  date: Date,
  status: 'Approved' | 'Pending',
  blockchainHash?: string  // for immutability
}
```

### Current Data Flow (Desktop GUI Only)

```
User Input (Child Data)
    ↓
gui.py (TkGUI Entry Fields)
    ↓
prediction.py (BMI Calculation)
    ↓
preprocessing.py (Normalize Height/Weight)
    ↓
recommendation.py (Generate Recommendations)
    ↓
Output: Color-coded Status Card + CSV Export
    ↓
sam_reports.csv (Local Storage)
```

### Missing Data Flow (When Backend is Built)

```
Mobile App (React Native)
    ↓
API Client (axios/fetch)
    ↓
Backend Server (Flask/FastAPI)
    ↓
Database (PostgreSQL)
    ↓
Prediction Service (Python ML)
    ↓
Blockchain Ledger (Immutable Transaction Log)
    ↓
Response to Mobile App
    ↓
Display Results & Save Locally
```

---

## 🔑 KEY COMPONENTS & PURPOSE

### Python Backend Components

#### 1. **blockchain.py** - Immutable Transaction Ledger
```python
class Block:
    - index: sequential block number
    - timestamp: when block was created
    - transaction: transaction description (e.g., "Medicine Purchase ₹2500")
    - previous_hash: links to prior block
    - hash: SHA256 of current block

class Blockchain:
    - chain: list of blocks
    - get_latest_block(): returns last block
    - add_block(transaction): appends new block
```
**Purpose**: Maintain transparent, immutable records of medical purchases and fund allocations  
**Status**: Working but not integrated  
**Sample Data**: Medicine purchases, nutrition packs, formula costs

#### 2. **prediction.py** - SAM Risk Classification
```python
Functions:
- calculate_bmi(weight, height_cm): BMI = weight / (height_m²)
- classify_bmi(bmi): maps BMI to category
- predict_sam(weight, height_cm, age): returns detailed risk profile
  * Returns: Age, Normalized Height, Normalized Weight, BMI, Category, Risk Level
```
**Logic**:
- BMI < 14: Severe Acute Malnutrition (SAM)
- BMI 14-18: Moderate Malnutrition
- BMI > 18: Healthy
- Age < 5 multiplier: Increases risk factor

**Status**: Rule-based (not ML), but functional  
**Output Example**:
```python
{
  "Age": 12,
  "Normalized Height": 0.425,
  "Normalized Weight": 0.95,
  "BMI": 15.8,
  "Category": "Moderate Malnutrition",
  "Risk": "Moderate Risk"
}
```

#### 3. **preprocessing.py** - Data Normalization
```python
- normalize_height(height_cm): height_cm / 200
- normalize_weight(weight): weight / 100
```
**Purpose**: Scale anthropometric data to 0-1 range for ML readiness  
**Status**: Basic, functional

#### 4. **recommendation.py** - Intervention Suggestions
```python
Outputs rule-based recommendations with:
- Confidence score (94-99%)
- WHO Z-score range (e.g., < -3 SD)
- Clinical recommendations (e.g., "Begin therapeutic feeding")
```
**Status**: Hardcoded rules, not data-driven

#### 5. **gui.py** - Desktop Dashboard (CustomTkinter)
**Layout**: 4-panel responsive dashboard

| Section | Purpose |
|---------|---------|
| **Top Nav** | Title, hardware status, real-time clock |
| **Left Panel** | Child profile, image capture, form input |
| **Center Panel** | 8 sensor metric cards (height, weight, BMI, MUAC, etc.) |
| **Right Panel** | AI prediction results with color-coded status |
| **Bottom Actions** | Buttons: Scan, Predict, Generate Recommendation, Save Report, Clear |

**Features**:
- Mock sensor data with progress bars
- Real-time prediction with GUI updates
- CSV export to `sam_reports.csv`
- Color-coded status: 🟢 Green (Healthy), 🟡 Yellow (Moderate), 🔴 Red (Severe)

**Status**: Fully functional, but sensors not connected

#### 6. **main.py** - Test Entry Point
```python
from prediction import predict_sam
result = predict_sam(12, 95, 4)
```
**Status**: Simple demo script

#### 7. **transaction_test.py** - Blockchain Demo
Demonstrates blockchain by creating sample transactions:
- Medicine Purchase ₹2500
- Nutrition Pack ₹1500
- F-75 Formula ₹3200

**Status**: Works but isolated

### React Native Frontend Components

#### Screens (9 Total)

| Screen | Purpose | Data Source |
|--------|---------|-------------|
| **SplashScreen** | Welcome/intro with stats | Hardcoded |
| **LoginScreen** | User authentication form | ❌ No backend |
| **DashboardScreen** | Main dashboard with stats, alerts, fund overview | Hardcoded |
| **ChildRegistrationScreen** | Form to add new child | ❌ No API |
| **ChildrenListScreen** | Registry table with 6 sample children | Mock array |
| **NRCCentersScreen** | NRC center management with 5 centers | Mock array |
| **FundManagementScreen** | Budget tracking & disbursements | Hardcoded |
| **ReportsScreen** | Analytics with charts (LineChart from react-native-chart-kit) | Mock data |
| **ProfileScreen** | User profile & account settings | Hardcoded |

#### Shared Components (5 Reusable)

| Component | Props | Use |
|-----------|-------|-----|
| **Button.tsx** | label, onPress, variant (primary/outline/danger), loading, disabled, icon | All screens |
| **InputField.tsx** | label, icon, placeholder, value, onChangeText, keyboardType, secureEntry | Forms |
| **Card.tsx** (StatCard) | label, value, color, icon | Dashboard stats |
| **HeaderBar.tsx** | title, subtitle, showBack, onBack | Screen headers |
| **ProgressBar.tsx** | label, amount, value, color | Fund, NRC occupancy displays |

#### Navigation Structure
```
RootStackParamList (TypeScript types):
├── Splash
├── Login
├── MainTabs
│   ├── Dashboard (default)
│   ├── Children
│   ├── NRCCenters
│   ├── Funds
│   └── Profile
├── ChildRegistration
└── Reports
```

#### Theme System (Consistent Design)

**Colors** (`theme/colors.ts`):
```typescript
- primary: '#002B5B' (Dark Blue - government)
- accent: '#F4A832' (Orange - action)
- success: '#4CAF50' (Green - healthy)
- error: '#E53935' (Red - SAM)
- warning: '#FF9800' (Orange - moderate)
```

**Spacing** (`theme/spacing.ts`): Consistent padding/margins  
**Typography** (`theme/typography.ts`): Font sizes and weights

---

## 🔌 INTEGRATION POINTS (MISSING)

### 1. Frontend ↔ Backend API Integration
**Current**: ❌ None (all mock data)  
**Needed**:
```typescript
// Expected API endpoints
POST /api/auth/login
POST /api/children
GET /api/children
GET /api/children/:id
PUT /api/children/:id
POST /api/predict
GET /api/nrc-centers
GET /api/funds
GET /api/reports
```

### 2. Prediction Model Integration
**Current**: Rule-based BMI classification  
**Missing**:
- Call prediction.py from mobile app
- Train actual ML model on historical data
- Real WHO Z-score calculation (currently approximated)
- MUAC-based classification (mentioned in GUI but not in model)

### 3. Blockchain Integration
**Current**: Isolated ledger with test transactions  
**Missing**:
- Verify fund transactions on blockchain
- Hash fund disbursements for immutability
- Connect to actual blockchain network (Ethereum, Polygon, or private chain)

### 4. Database Integration
**Current**: ❌ None  
**Needed**:
- PostgreSQL schema for children, nrc_centers, funds, transactions, users
- User authentication table with roles
- Historical data for analytics

### 5. Hardware Integration (Mentioned in GUI)
**Current**: ❌ Mock only  
**Mentioned but not implemented**:
- Raspberry Pi camera (for "Capture Image")
- Ultrasonic sensors (distance measurement for anthropometrics)
- Load cell sensors (for weight)
- These would feed into sensor readings currently showing mock values

### 6. Export/Reporting Integration
**Current**: ✅ CSV export works locally  
**Missing**:
- PDF report generation
- Cloud storage integration
- Email/SMS notifications

---

## ✅ WHAT WORKS

1. **Desktop GUI is fully functional**
   - All UI elements render correctly
   - Data input and prediction workflow complete
   - CSV export mechanism functional
   - Color-coded status system works

2. **Mobile app navigation is complete**
   - All screens navigate correctly
   - Tab navigation responsive
   - Form validations in place
   - Logout flow implemented

3. **Data models are well-structured**
   - Child data schema comprehensive
   - NRC center tracking detailed
   - Fund allocation breakdown clear
   - Transaction history tracked

4. **UI/UX is modern and professional**
   - Consistent theme across app
   - Responsive layouts
   - Government branding (Chhattisgarh emblem, India colors)
   - Accessibility: proper color contrast, icon use

5. **BMI-based SAM detection works**
   - Mathematical calculation is correct
   - Risk categorization logic is sensible
   - Recommendations are appropriate

---

## ❌ WHAT'S INCOMPLETE / BROKEN

1. **No actual backend server**
   - No Flask/Django/FastAPI app
   - No running server for API calls
   - No database queries

2. **Authentication is non-functional**
   - Login form exists but doesn't validate
   - No JWT token generation
   - No user session management
   - No role-based access control

3. **Data persistence is missing**
   - Desktop app saves to local CSV only
   - Mobile app has no persistent storage
   - No database backend
   - No synchronization between apps

4. **ML Model is not real ML**
   - Simple BMI-based rule system, not neural network
   - Not trained on historical malnutrition data
   - Cannot handle edge cases or complex patterns

5. **Blockchain is disconnected**
   - Works in isolation
   - Not integrated with payment/transaction systems
   - Not connected to any blockchain network

6. **Hardware is not integrated**
   - Sensors mentioned but not actually connected
   - Image capture UI exists but no camera module
   - "Scan" button doesn't do anything

7. **No offline capability**
   - Mobile app cannot work without internet
   - No local caching mechanism
   - No sync queue for offline operations

8. **Charts are placeholder-only**
   - LineChart shows hardcoded data
   - Not connected to database
   - Not real-time or dynamic

---

## 📋 SUMMARY TABLE

| Aspect | Status | Details |
|--------|--------|---------|
| **Desktop GUI** | ✅ Complete | CustomTkinter, functional UI, CSV export works |
| **Mobile App UI** | ✅ Complete | React Native with React Navigation, all screens built |
| **Backend Server** | ❌ Missing | No API server, no routes, no authentication |
| **Database** | ❌ Missing | No schema, no tables, only mock data |
| **ML Model** | ⚠️ Rule-based | BMI classification works but not actual ML |
| **Blockchain** | ⚠️ Isolated | Works but not integrated with system |
| **Authentication** | ❌ Non-functional | UI exists, no validation logic |
| **Frontend-Backend Integration** | ❌ None | No API calls from mobile to Python |
| **Hardware Integration** | ❌ None | No sensors, camera, or Raspberry Pi connected |
| **Data Persistence** | ⚠️ Partial | CSV on desktop, no mobile persistence |
| **User Roles** | ❌ Missing | No role-based access control |
| **Real-time Sync** | ❌ None | No WebSocket or polling mechanism |
| **Offline Support** | ❌ None | No offline-first architecture |

---

## 🚀 RECOMMENDATIONS TO COMPLETE PROJECT

### Phase 1: Connect the Systems
1. Create Flask/FastAPI backend
2. Set up PostgreSQL database
3. Build REST API endpoints
4. Implement user authentication (JWT)

### Phase 2: Real ML Integration
1. Collect historical SAM data
2. Train classification model (TensorFlow/Scikit-learn)
3. Replace rule-based with ML predictions
4. Add WHO Z-score calculation

### Phase 3: Blockchain Integration
1. Set up Ethereum/Polygon testnet
2. Create smart contract for transaction verification
3. Connect fund disbursements to blockchain

### Phase 4: Hardware Integration
1. Set up Raspberry Pi with sensors
2. Write sensor polling code
3. Connect to desktop GUI
4. Calibrate sensors for accuracy

### Phase 5: Production Readiness
1. Add comprehensive error handling
2. Implement logging and monitoring
3. Add push notifications
4. Deploy to production environment (AWS/Azure)

---

## 📁 PROJECT FILE STRUCTURE

```
SAM/
├── Python Backend (Desktop)
│   ├── blockchain.py           # Immutable ledger (SHA256 blocks)
│   ├── gui.py                  # CustomTkinter dashboard (main app)
│   ├── prediction.py           # BMI-based SAM prediction
│   ├── preprocessing.py        # Height/weight normalization
│   ├── recommendation.py       # Rule-based recommendations
│   ├── main.py                 # Entry point (test)
│   ├── transaction_test.py     # Blockchain demo
│   └── sam_reports.csv         # Local report export
│
└── NRC-eGov/ (React Native Mobile)
    ├── App.tsx                 # Root component
    ├── app.json                # Expo configuration
    ├── package.json            # Dependencies (React Navigation, Charts)
    ├── tsconfig.json           # TypeScript config
    ├── babel.config.js         # Babel config
    ├── src/
    │   ├── navigation/
    │   │   ├── AppNavigator.tsx        # Stack + Tab navigation
    │   │   └── types.ts                # RootStackParamList
    │   │
    │   ├── screens/
    │   │   ├── SplashScreen.tsx        # Welcome screen
    │   │   ├── LoginScreen.tsx         # Authentication
    │   │   ├── DashboardScreen.tsx     # Main dashboard
    │   │   ├── ChildRegistrationScreen.tsx   # Child form
    │   │   ├── ChildrenListScreen.tsx  # Child registry
    │   │   ├── NRCCentersScreen.tsx    # NRC management
    │   │   ├── FundManagementScreen.tsx# Fund tracking
    │   │   ├── ReportsScreen.tsx       # Analytics
    │   │   └── ProfileScreen.tsx       # User profile
    │   │
    │   ├── components/
    │   │   ├── Button.tsx              # Reusable button
    │   │   ├── InputField.tsx          # Form input
    │   │   ├── Card.tsx                # Stat cards
    │   │   ├── HeaderBar.tsx           # Screen header
    │   │   └── ProgressBar.tsx         # Progress display
    │   │
    │   └── theme/
    │       ├── colors.ts               # Color palette
    │       ├── spacing.ts              # Spacing/sizing
    │       └── typography.ts           # Font styles
    │
    └── assets/
        ├── icon.png
        ├── splash-icon.png
        ├── adaptive-icon.png
        └── favicon.png
```

---

## 🎯 FINAL ASSESSMENT

**Current State**: 
- Two disconnected applications
- Desktop app: 80% complete, needs sensor integration
- Mobile app: 100% UI complete, 0% backend integration
- Both need database and API layer

**Time to Full Deployment**:
- Backend API: 2-3 weeks
- Database & Auth: 1 week
- ML Training: 2-4 weeks
- Integration & Testing: 2 weeks
- **Total: 7-10 weeks** for a production-ready system

**Biggest Gaps**:
1. No backend API connecting mobile to Python
2. No database persistence
3. No actual ML model (only rule-based)
4. No hardware integration
5. No user authentication system

This is a **well-designed prototype** with good UI/UX but requires significant backend work to be functional as a government system.
