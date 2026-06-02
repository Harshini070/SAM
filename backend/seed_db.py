"""
Seed data script for Chhattisgarh Child Nutrition Backend
This script initializes MongoDB with sample data for testing and development
"""

import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def seed_database():
    """Seed MongoDB with initial data"""
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    print("🌱 Seeding database...")
    
    try:
        # Clear existing data (development only!)
        await db.nrc_centers.delete_many({})
        await db.children.delete_many({})
        await db.users.delete_many({})
        await db.admissions.delete_many({})
        await db.funds.delete_many({})
        await db.alerts.delete_many({})
        await db.otps.delete_many({})
        print("✓ Cleared existing database collections")
        
        # 1. Create NRC Centers
        nrc_centers = [
            {
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
                "created_at": datetime.utcnow()
            },
            {
                "nrc_id": "NRC_BILASPUR_01",
                "name": "Bilaspur NRC",
                "district": "Bilaspur",
                "address": "Hospital Road, Bilaspur",
                "phone": "07752-456789",
                "total_beds": 80,
                "occupied_beds": 42,
                "staff_count": 30,
                "latitude": 22.0796,
                "longitude": 82.1554,
                "created_at": datetime.utcnow()
            },
            {
                "nrc_id": "NRC_DURG_01",
                "name": "Durg NRC",
                "district": "Durg",
                "address": "Civil Hospital, Durg",
                "phone": "0788-567890",
                "total_beds": 100,
                "occupied_beds": 65,
                "staff_count": 38,
                "latitude": 21.1900,
                "longitude": 81.2631,
                "created_at": datetime.utcnow()
            },
            {
                "nrc_id": "NRC_BASTAR_01",
                "name": "Jagdalpur NRC",
                "district": "Bastar",
                "address": "Medical College, Jagdalpur",
                "phone": "07782-678901",
                "total_beds": 60,
                "occupied_beds": 45,
                "staff_count": 22,
                "latitude": 20.8067,
                "longitude": 81.7938,
                "created_at": datetime.utcnow()
            },
            {
                "nrc_id": "NRC_RAJNANDGAON_01",
                "name": "Rajnandgaon NRC",
                "district": "Rajnandgaon",
                "address": "District Hospital, Rajnandgaon",
                "phone": "07844-789012",
                "total_beds": 50,
                "occupied_beds": 28,
                "staff_count": 18,
                "latitude": 22.9389,
                "longitude": 81.0347,
                "created_at": datetime.utcnow()
            }
        ]
        
        await db.nrc_centers.insert_many(nrc_centers)
        print(f"✓ Created {len(nrc_centers)} NRC centers")
        
        # 2. Create sample children
        children = [
            {
                "child_id": "CHILD_001",
                "name": "Aditya Sharma",
                "dob": datetime(2023, 3, 15),
                "gender": "M",
                "mother_name": "Geeta Sharma",
                "mother_phone": "9876543210",
                "village": "Raigaon",
                "district": "Raipur",
                "weight": 8.2,
                "height": 80.0,
                "muac": 112.0,
                "health_status": "sam",
                "nrc_assigned": "NRC_RAIPUR_01",
                "last_screening_date": datetime.utcnow() - timedelta(days=2),
                "next_followup_date": datetime.utcnow() + timedelta(days=13),
                "growth_history": [
                    {"date": "2026-03-15", "weight": 9.4, "height": 79.0, "muac": 124.0, "status": "healthy"},
                    {"date": "2026-04-15", "weight": 8.9, "height": 79.5, "muac": 118.0, "status": "mam"},
                    {"date": "2026-05-15", "weight": 8.2, "height": 80.0, "muac": 112.0, "status": "sam"}
                ],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "child_id": "CHILD_002",
                "name": "Priya Singh",
                "dob": datetime(2024, 6, 20),
                "gender": "F",
                "mother_name": "Anjali Singh",
                "mother_phone": "9876543211",
                "village": "Abhanpur",
                "district": "Raipur",
                "weight": 7.4,
                "height": 72.0,
                "muac": 120.0,
                "health_status": "mam",
                "nrc_assigned": None,
                "last_screening_date": datetime.utcnow() - timedelta(days=5),
                "next_followup_date": datetime.utcnow() + timedelta(days=10),
                "growth_history": [
                    {"date": "2026-04-20", "weight": 7.8, "height": 71.0, "muac": 124.0, "status": "healthy"},
                    {"date": "2026-05-20", "weight": 7.4, "height": 72.0, "muac": 120.0, "status": "mam"}
                ],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "child_id": "CHILD_003",
                "name": "Ravi Kumar",
                "dob": datetime(2023, 12, 8),
                "gender": "M",
                "mother_name": "Lakshmi Devi",
                "mother_phone": "9876543212",
                "village": "Kharora",
                "district": "Raipur",
                "weight": 11.2,
                "height": 84.0,
                "muac": 135.0,
                "health_status": "healthy",
                "nrc_assigned": None,
                "last_screening_date": datetime.utcnow() - timedelta(days=15),
                "next_followup_date": datetime.utcnow() + timedelta(days=15),
                "growth_history": [
                    {"date": "2026-03-08", "weight": 10.5, "height": 82.0, "muac": 132.0, "status": "healthy"},
                    {"date": "2026-04-08", "weight": 10.8, "height": 83.0, "muac": 133.0, "status": "healthy"},
                    {"date": "2026-05-08", "weight": 11.2, "height": 84.0, "muac": 135.0, "status": "healthy"}
                ],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "child_id": "CHILD_004",
                "name": "Maya Verma",
                "dob": datetime(2023, 8, 2),
                "gender": "F",
                "mother_name": "Sunita Verma",
                "mother_phone": "9876543213",
                "village": "Dongargarh",
                "district": "Bilaspur",
                "weight": 8.0,
                "height": 78.0,
                "muac": 114.0,
                "health_status": "sam",
                "nrc_assigned": "NRC_BILASPUR_01",
                "last_screening_date": datetime.utcnow() - timedelta(days=1),
                "next_followup_date": datetime.utcnow() + timedelta(days=14),
                "growth_history": [
                    {"date": "2026-03-02", "weight": 9.2, "height": 77.0, "muac": 122.0, "status": "healthy"},
                    {"date": "2026-04-02", "weight": 8.6, "height": 77.5, "muac": 117.0, "status": "mam"},
                    {"date": "2026-05-02", "weight": 8.0, "height": 78.0, "muac": 114.0, "status": "sam"}
                ],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "child_id": "CHILD_005",
                "name": "Rahul Patel",
                "dob": datetime(2023, 1, 25),
                "gender": "M",
                "mother_name": "Pooja Patel",
                "mother_phone": "9876543210",
                "village": "Bhilai",
                "district": "Durg",
                "weight": 9.1,
                "height": 82.0,
                "muac": 122.0,
                "health_status": "mam",
                "nrc_assigned": None,
                "last_screening_date": datetime.utcnow() - timedelta(days=7),
                "next_followup_date": datetime.utcnow() + timedelta(days=8),
                "growth_history": [
                    {"date": "2026-04-25", "weight": 9.5, "height": 81.5, "muac": 126.0, "status": "healthy"},
                    {"date": "2026-05-25", "weight": 9.1, "height": 82.0, "muac": 122.0, "status": "mam"}
                ],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        await db.children.insert_many(children)
        print(f"✓ Created {len(children)} sample children")
        
        # 3. Create sample users
        users = [
            {
                "phone": "9876543210",
                "role": "parent",
                "name": "Geeta Sharma",
                "email": None,
                "district": "Raipur",
                "center_id": None,
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "phone": "9876543215",
                "role": "mitanin",
                "name": "Sneha Yadav",
                "email": "sneha@mitanin.org",
                "district": "Raipur",
                "center_id": "MITANIN_001",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "phone": "9876543216",
                "role": "anganwadi",
                "name": "Mamta Kumari",
                "email": "mamta@anganwadi.org",
                "district": "Raipur",
                "center_id": "AWC_001",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "phone": "9876543217",
                "role": "phc",
                "name": "Dr. Rajesh Patel",
                "email": "rajesh@phc.org",
                "district": "Raipur",
                "center_id": "PHC_001",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "phone": "9876543218",
                "role": "nrc",
                "name": "Dr. Nisha Singh",
                "email": "nisha@nrc.org",
                "district": "Raipur",
                "center_id": "NRC_RAIPUR_01",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "phone": "9876543219",
                "role": "district_officer",
                "name": "Abhay Kumar (DM)",
                "email": "abhay@district.gov",
                "district": "Raipur",
                "center_id": None,
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "phone": "9876543220",
                "role": "state_admin",
                "name": "Dr. Asha Pandey (State Health Officer)",
                "email": "asha@health.gov.cg",
                "district": None,
                "center_id": None,
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        ]
        
        await db.users.insert_many(users)
        print(f"✓ Created {len(users)} sample users")
        
        # 4. Create sample admissions
        admissions = [
            {
                "admission_id": "ADM_001",
                "child_id": "CHILD_001",
                "nrc_id": "NRC_RAIPUR_01",
                "status": "under_treatment",
                "admission_date": datetime.utcnow() - timedelta(days=30),
                "discharge_date": None,
                "treatment_notes": "SAM case with therapeutic food intervention",
                "recovery_percentage": 45.5,
                "created_at": datetime.utcnow()
            },
            {
                "admission_id": "ADM_002",
                "child_id": "CHILD_004",
                "nrc_id": "NRC_BILASPUR_01",
                "status": "admitted",
                "admission_date": datetime.utcnow() - timedelta(days=5),
                "discharge_date": None,
                "treatment_notes": "Just admitted, starting baseline assessment",
                "recovery_percentage": 0.0,
                "created_at": datetime.utcnow()
            }
        ]
        
        await db.admissions.insert_many(admissions)
        print(f"✓ Created {len(admissions)} sample admissions")
        
        # 5. Create sample funds
        funds = [
            {
                "fund_id": "FUND_001",
                "category": "Therapeutic Foods",
                "allocated_amount": 100000000.0,  # ₹1 Cr
                "spent_amount": 67500000.0,       # ₹67.5 L
                "district": "State",
                "fiscal_year": 2024,
                "updated_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            },
            {
                "fund_id": "FUND_002",
                "category": "Medical Supplies",
                "allocated_amount": 50000000.0,   # ₹50 L
                "spent_amount": 35000000.0,       # ₹35 L
                "district": "State",
                "fiscal_year": 2024,
                "updated_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            },
            {
                "fund_id": "FUND_003",
                "category": "Staff Salaries",
                "allocated_amount": 80000000.0,   # ₹80 L
                "spent_amount": 76000000.0,       # ₹76 L
                "district": "State",
                "fiscal_year": 2024,
                "updated_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            },
            {
                "fund_id": "FUND_004",
                "category": "Operations",
                "allocated_amount": 30000000.0,   # ₹30 L
                "spent_amount": 18000000.0,       # ₹18 L
                "district": "State",
                "fiscal_year": 2024,
                "updated_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            },
            {
                "fund_id": "FUND_005",
                "category": "Emergency Fund",
                "allocated_amount": 40000000.0,   # ₹40 L
                "spent_amount": 5000000.0,        # ₹5 L
                "district": "State",
                "fiscal_year": 2024,
                "updated_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
        ]
        
        await db.funds.insert_many(funds)
        print(f"✓ Created {len(funds)} fund allocations")
        
        # Create sample alerts
        import os
        alerts = [
            {
                "recipient_phone": "9876543210",
                "recipient_id": None,
                "recipient_role": "parent",
                "alert_type": "sam_detected",
                "title": "🚨 URGENT: Aditya Sharma (SAM)",
                "message": "Aditya Sharma has been identified with Severe Acute Malnutrition (SAM). He has been referred and admitted to Raipur Main NRC for therapeutic treatment.",
                "data": {"child_id": "CHILD_001"},
                "status": "sent",
                "delivery_channel": "sms",
                "created_at": datetime.utcnow() - timedelta(days=2),
                "sent_at": datetime.utcnow() - timedelta(days=2),
                "delivery_id": "SM" + os.urandom(16).hex()
            },
            {
                "recipient_phone": "9876543210",
                "recipient_id": None,
                "recipient_role": "parent",
                "alert_type": "mam_detected",
                "title": "⚠️ Growth Alert: Rahul Patel (MAM)",
                "message": "Rahul Patel has been identified with Moderate Acute Malnutrition (MAM). Please collect 2 packets of RUTF daily from your assigned Anganwadi center.",
                "data": {"child_id": "CHILD_005"},
                "status": "sent",
                "delivery_channel": "sms",
                "created_at": datetime.utcnow() - timedelta(days=7),
                "sent_at": datetime.utcnow() - timedelta(days=7),
                "delivery_id": "SM" + os.urandom(16).hex()
            }
        ]
        
        await db.alerts.insert_many(alerts)
        print(f"✓ Created {len(alerts)} sample alerts")
        
        # 6. Create indexes
        await db.children.create_index([("child_id", 1)], unique=True)
        await db.children.create_index([("mother_phone", 1)])
        await db.children.create_index([("district", 1)])
        await db.nrc_centers.create_index([("nrc_id", 1)], unique=True)
        await db.users.create_index([("phone", 1)], unique=True)
        await db.admissions.create_index([("admission_id", 1)], unique=True)
        print("✓ Created database indexes")
        
        print("\n✅ Database seeding complete!")
        print("\nSample Login Credentials:")
        print("─" * 50)
        for user in users:
            print(f"Role: {user['role']:20} Phone: {user['phone']}")
        
        print("\n📊 Sample Data Created:")
        print("─" * 50)
        print(f"NRC Centers: {len(nrc_centers)}")
        print(f"Children: {len(children)}")
        print(f"  - SAM cases: 2")
        print(f"  - MAM cases: 2")
        print(f"  - Healthy: 1")
        print(f"Users: {len(users)}")
        print(f"Admissions: {len(admissions)}")
        print(f"Funds: ₹3 Cr allocated")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
