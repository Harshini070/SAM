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
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    # Create indexes
    await create_indexes()
    print("✓ Connected to MongoDB")

async def disconnect_db():
    """Disconnect from MongoDB"""
    global client
    if client:
        client.close()
        print("✓ Disconnected from MongoDB")

async def create_indexes():
    """Create necessary indexes"""
    # Child collection
    await db.children.create_index([("phone", 1)], unique=True, sparse=True)
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
    
    print("✓ Database indexes created")

def get_db():
    """Get database instance"""
    return db
