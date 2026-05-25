from typing import Optional, List, Dict
from app.database import get_db
from app.models.device_token import DeviceToken
from datetime import datetime
import logging
import httpx

logger = logging.getLogger(__name__)

class PushNotificationService:
    """Handle push notifications via Expo"""
    
    EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
    
    async def register_device_token(
        self,
        user_phone: str,
        device_token: str,
        device_type: str = "ios",
        user_id: Optional[str] = None
    ) -> bool:
        """Register a device token for push notifications"""
        try:
            db = await get_db()
            
            # Check if token already exists
            existing = await db.device_tokens.find_one({
                "device_token": device_token,
                "user_phone": user_phone
            })
            
            if existing:
                # Update last_used_at
                await db.device_tokens.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"last_used_at": datetime.utcnow()}}
                )
                return True
            
            # Create new token
            token = DeviceToken(
                user_phone=user_phone,
                device_token=device_token,
                device_type=device_type,
                user_id=user_id
            )
            
            result = await db.device_tokens.insert_one(token.to_dict())
            logger.info(f"Device token registered: {result.inserted_id}")
            
            return True
        except Exception as e:
            logger.error(f"Failed to register device token: {e}")
            return False
    
    async def unregister_device_token(self, device_token: str) -> bool:
        """Unregister a device token"""
        try:
            db = await get_db()
            result = await db.device_tokens.delete_one({"device_token": device_token})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Failed to unregister device token: {e}")
            return False
    
    async def send_push_notification(
        self,
        user_phone: str,
        title: str,
        body: str,
        data: Optional[Dict] = None,
        badge: Optional[int] = None
    ) -> Dict[str, any]:
        """Send push notification to user's devices"""
        try:
            db = await get_db()
            
            # Get all active device tokens for user
            tokens = await db.device_tokens.find({
                "user_phone": user_phone,
                "is_active": True
            }).to_list(None)
            
            if not tokens:
                logger.warning(f"No active device tokens for {user_phone}")
                return {"success": False, "message": "No active devices"}
            
            # Prepare messages for Expo
            messages = [
                {
                    "to": token["device_token"],
                    "sound": "default",
                    "title": title,
                    "body": body,
                    "data": data or {},
                    "badge": badge
                }
                for token in tokens
            ]
            
            # Send via Expo
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.EXPO_PUSH_URL,
                    json=messages,
                    timeout=30.0
                )
                
                result = response.json()
                logger.info(f"Push notification sent to {len(tokens)} devices")
                
                return {
                    "success": True,
                    "sent_count": len(tokens),
                    "response": result
                }
            
        except Exception as e:
            logger.error(f"Failed to send push notification: {e}")
            return {"success": False, "error": str(e)}
    
    async def send_push_to_role(
        self,
        role: str,
        title: str,
        body: str,
        data: Optional[Dict] = None,
        district: Optional[str] = None
    ) -> Dict[str, any]:
        """Send push notification to all users with a specific role"""
        try:
            db = await get_db()
            
            # Find users by role
            query = {"role": role}
            if district and role in ["anganwadi", "phc", "nrc", "district_officer"]:
                query["district"] = district
            
            users = await db.users.find(query).to_list(None)
            
            if not users:
                return {"success": False, "message": "No users found"}
            
            # Get device tokens for all users
            sent_count = 0
            failed_count = 0
            
            for user in users:
                result = await self.send_push_notification(
                    user_phone=user["phone"],
                    title=title,
                    body=body,
                    data=data
                )
                
                if result["success"]:
                    sent_count += result.get("sent_count", 1)
                else:
                    failed_count += 1
            
            return {
                "success": True,
                "total_sent": sent_count,
                "failed": failed_count
            }
        except Exception as e:
            logger.error(f"Failed to send push to role: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_user_devices(self, user_phone: str) -> List[Dict]:
        """Get all registered devices for a user"""
        try:
            db = await get_db()
            devices = await db.device_tokens.find({
                "user_phone": user_phone
            }).to_list(None)
            return devices
        except Exception as e:
            logger.error(f"Failed to get user devices: {e}")
            return []
    
    async def disable_device_token(self, device_token: str) -> bool:
        """Disable a device token"""
        try:
            db = await get_db()
            result = await db.device_tokens.update_one(
                {"device_token": device_token},
                {"$set": {"is_active": False}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to disable device token: {e}")
            return False
