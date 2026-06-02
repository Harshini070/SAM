from app.database import get_db
from app.utils.auth import generate_otp, create_access_token, create_refresh_token
from app.models.otp import OTP
from app.models.user import User, UserRole
from datetime import datetime, timedelta
from typing import Optional

class AuthService:
    def __init__(self):
        self.db = get_db()

    async def send_otp(self, phone: str) -> bool:
        """Generate and send OTP to phone"""
        otp_code = generate_otp()
        
        # Save OTP to database
        otp_doc = {
            "phone": phone,
            "code": otp_code,
            "expires_at": datetime.utcnow() + timedelta(minutes=10),
            "attempts": 0,
            "is_verified": False,
            "created_at": datetime.utcnow()
        }
        
        await self.db.otps.update_one(
            {"phone": phone},
            {"$set": otp_doc},
            upsert=True
        )
        
        # TODO: Integrate Twilio to send SMS
        # For now, just log it
        print(f"OTP for {phone}: {otp_code}")
        return True

    async def verify_otp(self, phone: str, code: str) -> tuple[bool, Optional[str]]:
        """Verify OTP and return status"""
        otp_doc = await self.db.otps.find_one({"phone": phone})
        
        if not otp_doc:
            return False, "OTP not found"
        
        if datetime.utcnow() > otp_doc["expires_at"]:
            return False, "OTP expired"
        
        if otp_doc["attempts"] >= 3:
            return False, "Too many attempts"
        
        if otp_doc["code"] != code:
            await self.db.otps.update_one(
                {"phone": phone},
                {"$inc": {"attempts": 1}}
            )
            return False, "Invalid OTP"
        
        # Mark as verified
        await self.db.otps.update_one(
            {"phone": phone},
            {"$set": {"is_verified": True}}
        )
        
        return True, None

    async def register_or_login_parent(self, phone: str) -> tuple[str, str]:
        """Register new parent or login existing parent"""
        user = await self.db.users.find_one({"phone": phone, "role": "parent"})
        
        if not user:
            # Create new parent user
            user_doc = {
                "phone": phone,
                "role": "parent",
                "name": f"Parent_{phone}",
                "district": None,
                "center_id": None,
                "is_active": True,
                "created_at": datetime.utcnow()
            }
            await self.db.users.insert_one(user_doc)
            user = user_doc
        
        # Generate tokens
        access_token = create_access_token({"phone": phone, "role": "parent"})
        refresh_token = create_refresh_token({"phone": phone, "role": "parent"})
        
        return access_token, refresh_token

    async def get_user_by_phone(self, phone: str) -> Optional[dict]:
        """Get user by phone"""
        return await self.db.users.find_one({"phone": phone})

    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by MongoDB ObjectId"""
        from bson import ObjectId
        return await self.db.users.find_one({"_id": ObjectId(user_id)})

    async def update_profile(self, phone: str, update_data: dict) -> bool:
        """Update user profile fields by phone number"""
        try:
            result = await self.db.users.update_one(
                {"phone": phone},
                {"$set": update_data}
            )
            return result.modified_count >= 0
        except Exception as e:
            print(f"Error in update_profile: {e}")
            return False
