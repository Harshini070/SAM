from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.requests import OTPRequest, OTPVerifyRequest, ProfileUpdateRequest
from app.schemas.responses import TokenResponse
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/parent/request-otp")
async def request_otp(request: OTPRequest):
    """Request OTP for parent login"""
    service = AuthService()
    
    try:
        success = await service.send_otp(request.phone)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP"
            )
        
        return {
            "message": "OTP sent successfully",
            "phone": request.phone,
            "validity_minutes": 10
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/parent/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerifyRequest):
    """Verify OTP and login parent"""
    service = AuthService()
    
    try:
        verified, error = await service.verify_otp(request.phone, request.code)
        
        if not verified:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error or "Invalid OTP"
            )
        
        access_token, refresh_token = await service.register_or_login_parent(request.phone)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=1800  # 30 minutes
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/test/get-otp")
async def get_test_otp(phone: str):
    """Retrieve current OTP for verification testing"""
    from app.database import get_db
    db = get_db()
    otp_doc = await db.otps.find_one({"phone": phone})
    if not otp_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OTP not found"
        )
    return {"code": otp_doc["code"]}

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    service = AuthService()
    user = await service.get_user_by_phone(current_user["phone"])
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "phone": user["phone"],
        "name": user.get("name"),
        "role": user["role"],
        "district": user.get("district"),
        "is_active": user.get("is_active", True)
    }

@router.put("/profile")
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile information"""
    service = AuthService()
    update_data = {k: v for k, v in request.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update"
        )
    
    success = await service.update_profile(current_user["phone"], update_data)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    return {"success": True, "message": "Profile updated successfully"}
