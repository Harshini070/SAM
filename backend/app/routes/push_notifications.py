from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.services.push_notification_service import PushNotificationService
from app.middleware.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/push", tags=["Push Notifications"])

class RegisterDeviceRequest(BaseModel):
    device_token: str
    device_type: str = "ios"  # ios or android

class SendPushRequest(BaseModel):
    user_phone: str
    title: str
    body: str
    data: Optional[dict] = None

class SendPushToRoleRequest(BaseModel):
    role: str
    title: str
    body: str
    data: Optional[dict] = None
    district: Optional[str] = None

# ===== Device Management =====

@router.post("/register-device")
async def register_device(
    request: RegisterDeviceRequest,
    current_user: dict = Depends(get_current_user)
):
    """Register device token for push notifications"""
    try:
        service = PushNotificationService()
        success = await service.register_device_token(
            user_phone=current_user.get("phone"),
            device_token=request.device_token,
            device_type=request.device_type,
            user_id=current_user.get("_id")
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register device"
            )
        
        return {
            "success": True,
            "message": "Device registered successfully"
        }
    except Exception as e:
        logger.error(f"Error registering device: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/unregister-device/{device_token}")
async def unregister_device(
    device_token: str,
    current_user: dict = Depends(get_current_user)
):
    """Unregister device token"""
    try:
        service = PushNotificationService()
        success = await service.unregister_device_token(device_token)
        
        return {
            "success": success,
            "message": "Device unregistered" if success else "Device not found"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/my-devices")
async def get_my_devices(current_user: dict = Depends(get_current_user)):
    """Get all registered devices for current user"""
    try:
        service = PushNotificationService()
        devices = await service.get_user_devices(current_user.get("phone"))
        
        return {
            "success": True,
            "count": len(devices),
            "devices": devices
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ===== Send Notifications =====

@router.post("/send")
async def send_notification(
    request: SendPushRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send push notification to a user"""
    try:
        service = PushNotificationService()
        result = await service.send_push_notification(
            user_phone=request.user_phone,
            title=request.title,
            body=request.body,
            data=request.data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("message", "Failed to send notification")
            )
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/send-to-role")
async def send_to_role(
    request: SendPushToRoleRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send push notification to all users with a specific role"""
    try:
        service = PushNotificationService()
        result = await service.send_push_to_role(
            role=request.role,
            title=request.title,
            body=request.body,
            data=request.data,
            district=request.district
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("message", "Failed to send notification")
            )
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
