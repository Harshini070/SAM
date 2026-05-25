"""
Chhattisgarh Child Nutrition Ecosystem - Architecture & Integration Guide

This document explains how all 7 stakeholder portals connect through the FastAPI backend
and MongoDB database for the complete end-to-end flow.
"""

# ECOSYSTEM HIERARCHY
# ====================
# 
# State Government
#        ↑
#  District Officer
#        ↑
#    NRC Center
#        ↑
#     PHC
#        ↑
#   Anganwadi
#        ↑
#     Mitanin (Frontline)
#        ↑
#   Parent/Guardian


# DATA FLOW
# =========
#
# 1. CHILD VISIT → SCREENING (Mitanin Portal)
#    Child visits Anganwadi
#    → Mitanin scans with IoT device (weight, height, MUAC)
#    → Backend receives: POST /api/children/screen
#    → AI predicts: SAM/MAM/Healthy
#    → Stores result in MongoDB children collection
#
# 2. IF HEALTHY
#    → Mark next screening in 30 days
#    → Parent receives SMS notification
#    → Continue monitoring
#
# 3. IF MAM (Moderate Acute Malnutrition)
#    → Notify Anganwadi
#    → Nutrition intervention recommended
#    → Followup in 15 days
#    → Post to Anganwadi Portal
#
# 4. IF SAM (Severe Acute Malnutrition) - CRITICAL
#    → Notify PHC immediately: SMS + Alert
#    → Notify NRC: POST /api/nrc/admit
#    → Auto-find nearest NRC with beds: GET /api/nrc/nearest
#    → Generate referral
#    → Create admission record
#    → Blockchain log transaction
#    → Alert District Officer
#
# 5. NRC TREATMENT
#    → Child admitted to NRC
#    → NRC staff updates: PUT /api/nrc/admissions/{id}
#    → Track recovery percentage
#    → Blockchain logs all interventions
#    → SMS updates to parent
#
# 6. DISCHARGE & RECOVERY TRACKING
#    → Mark as discharged
#    → Calculate recovery metrics
#    → Generate reports for District
#    → Update state analytics
#    → Blockchain verification by audit


# PORTAL-BY-PORTAL INTEGRATION
# =============================

# ┌─────────────────────────────────────────────────────────────────┐
# │ 1. PARENT PORTAL (Mobile App - React Native)                    │
# ├─────────────────────────────────────────────────────────────────┤
# │ Access: Phone + OTP (no email, no password required)            │
# │                                                                 │
# │ Routes Used:                                                    │
# │ - POST   /api/auth/parent/request-otp                          │
# │ - POST   /api/auth/parent/verify-otp                           │
# │ - GET    /api/children/by-mother/{phone}                       │
# │ - GET    /api/children/{child_id}                              │
# │ - GET    /api/analytics/dashboard (limited view)               │
# │                                                                 │
# │ Dashboard Shows:                                                │
# │ - Child health status                                          │
# │ - Nutrition plans                                              │
# │ - Appointment dates                                            │
# │ - Recovery status                                              │
# │ - Alerts & Followup reminders (SMS)                            │
# │                                                                 │
# │ Offline Mode:                                                  │
# │ - Cache child data locally                                     │
# │ - Sync when internet available                                 │
# └─────────────────────────────────────────────────────────────────┘

# ┌─────────────────────────────────────────────────────────────────┐
# │ 2. MITANIN PORTAL (Frontline - Mobile App)                      │
# ├─────────────────────────────────────────────────────────────────┤
# │ Access: Phone authentication + role verification               │
# │ Role: MITANIN                                                   │
# │                                                                 │
# │ Dashboard Features:                                             │
# │ - Today's screenings (real-time count)                         │
# │ - Pending followups (overdue)                                  │
# │ - High-risk children (SAM cases - red alerts)                  │
# │                                                                 │
# │ Actions:                                                        │
# │ - [+ Scan Child] → IoT device → Weight/Height/MUAC auto-fill   │
# │ - [+ Register Child] → POST /api/children/register             │
# │ - [Scan Workflow]:                                              │
# │   • Capture biometrics                                         │
# │   • POST /api/children/screen                                  │
# │   • Get instant prediction (SAM/MAM/Healthy)                   │
# │   • If SAM → POST /api/nrc/admit (auto-referral)              │
# │ - [Followups] → GET /api/children/pending-followups/list      │
# │ - [Reports] → GET /api/analytics/district/{district}          │
# │                                                                 │
# │ Notifications:                                                  │
# │ - High-risk child alert → SMS                                  │
# │ - NRC bed available → SMS                                      │
# │ - Child discharged → SMS                                       │
# │                                                                 │
# │ Offline-First:                                                 │
# │ - All lookups cached locally                                   │
# │ - Scan data queued → syncs when online                         │
# │ - Queue retry on connection loss                               │
# └─────────────────────────────────────────────────────────────────┘

# ┌─────────────────────────────────────────────────────────────────┐
# │ 3. ANGANWADI CENTER PORTAL (Dashboard)                          │
# ├─────────────────────────────────────────────────────────────────┤
# │ Access: Staff login (phone-based)                              │
# │ Role: ANGANWADI                                                 │
# │                                                                 │
# │ Dashboard Shows:                                                │
# │ - Children enrolled (count)                                    │
# │ - Malnutrition % (MAM + SAM / total)                          │
# │ - Nutrition programs active                                    │
# │ - Followups pending by Mitanin                                 │
# │                                                                 │
# │ Routes Used:                                                    │
# │ - GET /api/children/by-district/{district}                    │
# │ - GET /api/analytics/dashboard                                 │
# │ - GET /api/children/pending-followups/list                    │
# │                                                                 │
# │ Actions:                                                        │
# │ - View referrals from Mitanin                                  │
# │ - Coordinate with PHC for interventions                        │
# │ - Track recovery status                                        │
# └─────────────────────────────────────────────────────────────────┘

# ┌─────────────────────────────────────────────────────────────────┐
# │ 4. PHC (Primary Health Center) PORTAL                           │
# ├─────────────────────────────────────────────────────────────────┤
# │ Access: Staff login                                             │
# │ Role: PHC                                                       │
# │                                                                 │
# │ Dashboard Shows:                                                │
# │ - Nearby SAM cases (geographic radius)                         │
# │ - Medicine stock tracking                                      │
# │ - Referrals from Anganwadi                                     │
# │ - Treatment recommendations                                    │
# │                                                                 │
# │ Routes Used:                                                    │
# │ - GET /api/children/high-risk/list                             │
# │ - POST /api/nrc/admit (refer to NRC)                          │
# │ - GET /api/nrc/centers (find nearest)                         │
# │ - GET /api/nrc/centers/{nrc_id}/occupancy                     │
# │                                                                 │
# │ Blockchain Integration:                                         │
# │ - Log all medicine issued: POST transaction                    │
# │ - Prevent stock misappropriation                               │
# │ - Audit trail for accountability                               │
# └─────────────────────────────────────────────────────────────────┘

# ┌─────────────────────────────────────────────────────────────────┐
# │ 5. NRC (Nutrition Rehabilitation Center) PORTAL                 │
# ├─────────────────────────────────────────────────────────────────┤
# │ Access: Staff login                                             │
# │ Role: NRC                                                       │
# │                                                                 │
# │ Dashboard Shows:                                                │
# │ - Current admissions (count + details)                         │
# │ - Available beds                                               │
# │ - Treatment progress (recovery %)                              │
# │ - Discharge pipeline                                           │
# │ - Case studies & outcomes                                      │
# │                                                                 │
# │ Routes Used:                                                    │
# │ - GET /api/nrc/centers/{nrc_id}                               │
# │ - GET /api/nrc/centers/{nrc_id}/occupancy                     │
# │ - POST /api/nrc/admit (accept new admission)                  │
# │ - PUT /api/nrc/admissions/{admission_id} (update status)      │
# │ - GET /api/transactions/{nrc_id} (view fund flow)             │
# │ - GET /api/analytics/nrc/{nrc_id}/performance                 │
# │                                                                 │
# │ Workflows:                                                      │
# │ - [Accept Admission]:                                           │
# │   • Verify child details                                       │
# │   • POST /api/nrc/admit                                        │
# │   • Assign bed                                                 │
# │   • Start treatment log                                        │
# │                                                                 │
# │ - [Daily Updates]:                                              │
# │   • PUT /api/nrc/admissions/{id} with progress notes          │
# │   • Update recovery %                                          │
# │   • Flag complications                                         │
# │                                                                 │
# │ - [Discharge]:                                                  │
# │   • PUT /api/nrc/admissions/{id} (status=discharged)          │
# │   • Mark recovery status                                       │
# │   • Generate referral back to Anganwadi                        │
# │   • SMS alert to parent                                        │
# │                                                                 │
# │ - [No Beds Available]:                                          │
# │   • Auto-call GET /api/nrc/nearest                             │
# │   • Suggest next available center (even different district)    │
# │   • Blockchain logs transfer                                   │
# │                                                                 │
# │ Blockchain Integration:                                         │
# │ - Log every admission/treatment/discharge                      │
# │ - Track medicine/supply usage                                  │
# │ - Prevent fund misappropriation                                │
# │ - Recovery outcome verification                                │
# └─────────────────────────────────────────────────────────────────┘

# ┌─────────────────────────────────────────────────────────────────┐
# │ 6. DISTRICT OFFICER PORTAL (Analytics Dashboard)                │
# ├─────────────────────────────────────────────────────────────────┤
# │ Access: Staff login                                             │
# │ Role: DISTRICT_OFFICER                                          │
# │                                                                 │
# │ Analytics Show:                                                 │
# │ - SAM hotspots (map view)                                      │
# │ - Fund allocation & utilization                                │
# │ - Recovery trends (month-over-month)                           │
# │ - Center performance (NRC recovery rates)                      │
# │ - Referral pipeline (Anganwadi → PHC → NRC)                   │
# │                                                                 │
# │ Routes Used:                                                    │
# │ - GET /api/analytics/district/{district}                      │
# │ - GET /api/analytics/dashboard                                 │
# │ - GET /api/analytics/nrc/{nrc_id}/performance                 │
# │ - GET /api/transactions/{nrc_id}/verify (audit)               │
# │ - GET /api/transactions/{nrc_id}/chain/verify                 │
# │                                                                 │
# │ Example Dashboard:                                              │
# │ Raipur District:                                                │
# │ - Total children: 12,342                                       │
# │ - SAM cases: 1,342 (10.9%)                                    │
# │ - Recovery rate: 78%                                           │
# │ - Budget: ₹2.4 Cr (67.5% utilized)                           │
# │ - NRC beds: 85/120 occupied                                    │
# │ - Mitanins active: 456                                         │
# │ - Referrals pending: 23                                        │
# │                                                                 │
# │ Actions:                                                        │
# │ - Verify blockchain integrity (corruption detection)           │
# │ - Allocate funds                                               │
# │ - Monitor performance KPIs                                     │
# │ - Generate compliance reports                                  │
# └─────────────────────────────────────────────────────────────────┘

# ┌─────────────────────────────────────────────────────────────────┐
# │ 7. STATE ADMIN PORTAL (Government Dashboard)                    │
# ├─────────────────────────────────────────────────────────────────┤
# │ Access: Government staff login                                  │
# │ Role: STATE_ADMIN                                               │
# │                                                                 │
# │ Analytics Show:                                                 │
# │ - All districts overview                                       │
# │ - State-level fund management                                  │
# │ - Performance comparison (district ranking)                    │
# │ - Blockchain audit (corruption detection)                      │
# │ - Policy insights & recommendations                            │
# │                                                                 │
# │ Routes Used:                                                    │
# │ - GET /api/analytics/state                                     │
# │ - GET /api/analytics/dashboard                                 │
# │ - GET /api/transactions/{nrc_id}/chain/verify (state-level)   │
# │                                                                 │
# │ Example Dashboard:                                              │
# │ Chhattisgarh State Overview:                                    │
# │                                                                 │
# │ District          SAM Cases    Recovery Rate   Budget Util     │
# │ ──────────────────────────────────────────────────────────      │
# │ Raipur            1,342        78%             67.5%    🟢      │
# │ Bilaspur          892          82%             72.1%    🟢      │
# │ Durg              1,156        75%             61.3%    🟠      │
# │ Rajnandgaon       564          88%             69.8%    🟢      │
# │ Bastar            734          71%             45.2%    🔴      │
# │ Kanker            456          79%             70.5%    🟢      │
# │ Jagdalpur         378          81%             68.9%    🟢      │
# │                                                                 │
# │ Total: 6,512 SAM cases, 77% recovery, ₹24.5 Cr budget         │
# │                                                                 │
# │ Red Flags:                                                      │
# │ - Bastar: Low recovery rate (71%), needs intervention          │
# │ - 12 blockchain discrepancies detected (Durg district)         │
# │ - 45 NRC beds shortage (need expansion)                        │
# │                                                                 │
# │ Actions:                                                        │
# │ - View all districts                                           │
# │ - Monitor state funds                                          │
# │ - Verify blockchain integrity                                  │
# │ - Generate policy reports                                      │
# │ - Alert on anomalies                                           │
# └─────────────────────────────────────────────────────────────────┘


# API CALL SEQUENCES
# ===================

# SCENARIO 1: Child screening leads to SAM diagnosis & NRC admission
# ────────────────────────────────────────────────────────────────

# Step 1: Mitanin scans child with IoT device
POST /api/children/screen
{
    "child_id": "CHILD_ABC123",
    "weight": 12.5,  # kg
    "height": 85,    # cm
    "muac": 12.5,    # cm (Mid-Upper Arm Circumference)
    "age_months": 42
}

# Response:
{
    "child_id": "CHILD_ABC123",
    "bmi": 17.2,
    "status": "sam",  # ⚠️ CRITICAL
    "risk_level": "CRITICAL",
    "recommendation": "Immediate NRC referral required",
    "predicted_at": "2024-05-20T10:30:00Z",
    "next_followup_date": "2024-05-25T00:00:00Z"
}

# Step 2: Backend auto-triggers SMS alerts
# - Mitanin gets: "HIGH-RISK ALERT: Child ABC is SAM. Refer to NRC immediately."
# - PHC gets: "SAM referral incoming for District Raipur. Child ABC."
# - Parent gets: "Your child needs urgent medical attention. NRC referral initiated."

# Step 3: Mitanin initiates NRC admission
GET /api/nrc/nearest?latitude=21.2458&longitude=81.6304
# Finds nearest NRC with available beds

# Step 4: Admit to NRC
POST /api/nrc/admit
{
    "child_id": "CHILD_ABC123",
    "nrc_id": "NRC_RAIPUR_01",
    "treatment_notes": "SAM case referred by Mitanin. Urgent."
}

# Step 5: Blockchain logs transaction
POST /api/transactions (internal)
{
    "transaction_id": "TXN_XYZ789",
    "type": "admission",
    "amount": 5000,  # Cost of treatment
    "nrc_id": "NRC_RAIPUR_01",
    "description": "SAM child admission",
    "blockchain_hash": "abc123def456..."
}

# Step 6: NRC staff begins treatment
PUT /api/nrc/admissions/{admission_id}
{
    "status": "under_treatment",
    "recovery_percentage": 0,
    "treatment_notes": "Started therapeutic food program"
}

# Step 7: Parent gets updates (SMS + App)
# Daily updates to parent: "Child recovery at 25%"
# SMS: "Good news! Child improving. Recovery at 42%"

# Step 8: After 3 months → Discharge
PUT /api/nrc/admissions/{admission_id}
{
    "status": "discharged",
    "recovery_percentage": 95,
    "treatment_notes": "Full recovery. Back to normal weight/height."
}

# Parent gets: "🎉 Child discharged! Fully recovered. Followup after 30 days."


# SCENARIO 2: District Officer audits blockchain for corruption
# ─────────────────────────────────────────────────────────────

GET /api/transactions/NRC_RAIPUR_01/chain/verify
# Response:
{
    "nrc_id": "NRC_RAIPUR_01",
    "chain_valid": true,
    "message": "Chain integrity verified",
    "total_transactions": 1242,
    "verification_status": "✅ All transactions verified"
}

# If chain is broken (corruption detected):
{
    "nrc_id": "NRC_DURG_02",
    "chain_valid": false,
    "message": "Chain integrity compromised",
    "discrepancies": [
        {
            "transaction_id": "TXN_A001",
            "expected_hash": "abc123",
            "actual_hash": "xyz789",
            "impact": "Fund misappropriation detected: ₹50,000"
        }
    ],
    "action_needed": "Alert state government + FIR"
}


# DATABASE SCHEMA (MongoDB)
# ==========================

# users
{
    "_id": ObjectId,
    "phone": "9876543210",
    "role": "parent|mitanin|anganwadi|phc|nrc|district_officer|state_admin",
    "name": "Mother Name",
    "email": "optional@email.com",
    "district": "Raipur",
    "center_id": "NRC_RAIPUR_01",  # For staff
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
}

# children
{
    "_id": ObjectId,
    "child_id": "CHILD_ABC123",
    "name": "Child Name",
    "dob": "2022-05-15T00:00:00Z",
    "gender": "M",
    "mother_name": "Mother Name",
    "mother_phone": "9876543210",
    "village": "Raigaon",
    "district": "Raipur",
    "weight": 12.5,  # kg
    "height": 85,    # cm
    "muac": 12.5,    # cm
    "health_status": "sam|mam|healthy",
    "nrc_assigned": "NRC_RAIPUR_01",
    "last_screening_date": "2024-05-20T10:30:00Z",
    "next_followup_date": "2024-05-25T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-05-20T10:30:00Z"
}

# nrc_centers
{
    "_id": ObjectId,
    "nrc_id": "NRC_RAIPUR_01",
    "name": "Raipur Main NRC",
    "district": "Raipur",
    "address": "Medical College Road, Raipur",
    "phone": "0771-2345678",
    "total_beds": 120,
    "occupied_beds": 85,
    "staff_count": 45,
    "latitude": 21.2458,
    "longitude": 81.6304,
    "created_at": "2023-01-01T00:00:00Z"
}

# admissions
{
    "_id": ObjectId,
    "admission_id": "ADM_001234",
    "child_id": "CHILD_ABC123",
    "nrc_id": "NRC_RAIPUR_01",
    "status": "admitted|under_treatment|recovering|discharged",
    "admission_date": "2024-05-20T11:00:00Z",
    "discharge_date": null,
    "treatment_notes": "Started therapeutic food",
    "recovery_percentage": 25.5,
    "created_at": "2024-05-20T11:00:00Z"
}

# transactions
{
    "_id": ObjectId,
    "transaction_id": "TXN_XYZ789",
    "type": "purchase|delivery|usage|fund_allocation",
    "amount": 5000.00,
    "nrc_id": "NRC_RAIPUR_01",
    "description": "Therapeutic food purchase",
    "status": "pending|verified|completed|failed",
    "blockchain_hash": "sha256hashvalue...",
    "timestamp": "2024-05-20T12:00:00Z",
    "created_at": "2024-05-20T12:00:00Z"
}

# funds
{
    "_id": ObjectId,
    "fund_id": "FUND_001",
    "category": "Therapeutic Foods",
    "allocated_amount": 100000000.00,  # ₹1 Cr
    "spent_amount": 67500000.00,       # ₹67.5 L
    "district": "State",  # or specific district
    "fiscal_year": 2024,
    "updated_at": "2024-05-20T12:00:00Z",
    "created_at": "2024-04-01T00:00:00Z"
}


# OFFLINE-FIRST SYNC (Mobile App)
# ================================

# Local Storage (Device):
- Children list (cached)
- Screenings queue (pending uploads)
- Messages queue
- Analytics snapshots

# Sync Strategy:
1. On app launch: Check internet
2. If online:
   - Upload pending screenings: POST /api/children/screen
   - Download latest children list: GET /api/children/by-mother
   - Cache results locally with timestamp
3. If offline:
   - Use cached data
   - Queue new screenings locally
   - Show sync pending indicator
4. On reconnect: Automatic sync + conflict resolution

# Example Sync Payload:
POST /api/sync
{
    "device_id": "MITANIN_456",
    "last_sync": "2024-05-19T18:00:00Z",
    "pending_screenings": [
        {
            "child_id": "CHILD_DEF456",
            "weight": 13.2,
            "height": 86,
            "muac": 13.0,
            "age_months": 44,
            "timestamp": "2024-05-20T09:15:00Z"
        }
    ]
}


# SMS INTEGRATION (Twilio)
# ========================

Parent alerts:
- "Followup appointment tomorrow at Anganwadi"
- "Good news! Child recovered. Discharged from NRC"
- "⚠️ Child needs urgent screening"

Mitanin alerts:
- "HIGH-RISK: Child ABC is SAM. Refer to NRC."
- "NRC beds available. Can admit 5 more cases."
- "Followup overdue for 12 children"

NRC alerts:
- "New admission: Child ABC for SAM treatment"
- "Alert: Low stock of therapeutic food"
- "Transfer request: No beds, suggest NRC_BILASPUR_01"

District alerts:
- "Blockchain discrepancy detected in Durg district"
- "Fund utilization alert: 95% spent"
- "Recovery rate below target in Bastar"


# DEPLOYMENT CHECKLIST
# ====================

Before production:
□ MongoDB Atlas setup with backups
□ Environment variables configured
□ Twilio account setup (SMS)
□ JWT secrets generated
□ CORS configured for frontend domains
□ API rate limiting enabled
□ Error logging setup
□ Database migration scripts ready
□ Initial data (NRC centers, funds) loaded
□ SSL certificates configured
□ Load testing completed
□ Disaster recovery plan ready
□ Team training completed
□ Documentation updated

---

**Ready for Chhattisgarh Government deployment! 🚀**
