from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.config import settings
from typing import Optional

# Global database connection
client: Optional[AsyncIOMotorClient] = None
db = None

async def connect_db():
    """Connect to MongoDB"""
    global client, db
    try:
        # Override default resolver with Google DNS to bypass local router TXT query timeouts
        try:
            import dns.resolver
            dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
            dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1']
            print("SUCCESS: Injected Google DNS resolver overrides (8.8.8.8)")
        except Exception as e:
            print(f"WARNING: Failed to inject custom DNS resolver: {e}")
            
        client = AsyncIOMotorClient(settings.mongodb_url, serverSelectionTimeoutMS=2000)
        db = client[settings.database_name]
        # Test connection by running ping command
        await client.admin.command('ping')
        # Create indexes
        await create_indexes()
        print("SUCCESS: Connected to MongoDB Atlas")
    except Exception as e:
        print(f"WARNING: Connection to MongoDB Atlas failed: {e}")
        print("INFO: Falling back to in-memory MockDatabase...")
        from app.mock_db import MockDatabase
        db = MockDatabase()
        await seed_mock_db(db)
        print("SUCCESS: Local MockDatabase initialized & seeded")

async def seed_mock_db(db_instance):
    """Seed local mock database with test records for integration tests"""
    from datetime import datetime, timedelta
    
    # 1. Seed centers
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
        }
    ]
    await db_instance.nrc_centers.insert_many(nrc_centers)
    
    # 2. Seed test parent user
    parent_user = {
        "phone": "9876543210",
        "name": "Aditya's Mother",
        "role": "parent",
        "district": "Raipur",
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    await db_instance.users.insert_one(parent_user)

    # 3. Seed test child record
    child_record = {
        "child_id": "CHILD_TEST_99",
        "name": "Aditya Sharma",
        "dob": "2024-05-12T00:00:00",
        "gender": "Male",
        "mother_name": "Aditya's Mother",
        "mother_phone": "9876543210",
        "village": "Raipur Village",
        "district": "Raipur",
        "weight": 7.8,
        "height": 68.0,
        "muac": 112.0,
        "health_status": "SAM",
        "nrc_assigned": "Not assigned",
        "last_screening_date": datetime.utcnow().isoformat(),
        "growth_history": [
            {
                "date": (datetime.utcnow() - timedelta(days=30)).isoformat(),
                "weight": 7.4,
                "height": 67.0,
                "muac": 110.0,
                "status": "SAM"
            },
            {
                "date": datetime.utcnow().isoformat(),
                "weight": 7.8,
                "height": 68.0,
                "muac": 112.0,
                "status": "SAM"
            }
        ]
    }
    await db_instance.children.insert_one(child_record)

    # 4. Seed some alerts
    alert = {
        "recipient_phone": "9876543210",
        "title": "Severe Acute Malnutrition (SAM) Alert",
        "message": "Aditya Sharma was assessed with severe malnutrition. Please consult Raipur Main NRC.",
        "alert_type": "sam_detected",
        "status": "unread",
        "created_at": datetime.utcnow().isoformat()
    }
    await db_instance.alerts.insert_one(alert)

async def disconnect_db():
    """Disconnect from MongoDB"""
    global client
    if client:
        client.close()
        print("SUCCESS: Disconnected from MongoDB")

async def create_indexes():
    """Create necessary indexes"""
    # Child collection
    await db.children.create_index([("mother_phone", 1)])
    await db.children.create_index([("child_id", 1)], unique=True)
    await db.children.create_index([("district", 1)])
    
    # User collection
    await db.users.create_index([("phone", 1)], unique=True)
    await db.users.create_index([("email", 1)], unique=True, sparse=True)
    await db.users.create_index([("role", 1)])
    
    # OTP collection
    await db.otps.create_index([("phone", 1)])
    await db.otps.create_index([("expires_at", 1)], expireAfterSeconds=0)
    
    # NRC collection
    await db.nrc_centers.create_index([("district", 1)])
    await db.nrc_centers.create_index([("lat", "2dsphere"), ("lng", "2dsphere")])
    
    # Transactions
    await db.transactions.create_index([("timestamp", -1)])
    await db.transactions.create_index([("status", 1)])
    
    # Alerts
    await db.alerts.create_index([("recipient_phone", 1)])
    await db.alerts.create_index([("alert_type", 1)])
    await db.alerts.create_index([("created_at", -1)])
    await db.alerts.create_index([("status", 1)])
    
    # Device tokens
    await db.device_tokens.create_index([("user_phone", 1)])
    await db.device_tokens.create_index([("device_token", 1)], unique=True)
    await db.device_tokens.create_index([("is_active", 1)])

    # Idempotency checks (5-minute TTL)
    await db.idempotent_requests.create_index([("request_id", 1)], unique=True)
    await db.idempotent_requests.create_index([("created_at", 1)], expireAfterSeconds=300)
    
    print("SUCCESS: Database indexes created")

def get_db():
    """Get database instance"""
    return db
