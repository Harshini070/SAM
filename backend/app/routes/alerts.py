from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from app.services.alerts_service import AlertService
from app.models.alert import AlertType
from app.middleware.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Notifications"])

class SendAlertRequest(BaseModel):
    recipient_phone: str
    alert_type: str
    message: str
    data: dict = {}

class AlertResponse(BaseModel):
    success: bool
    message: str
    delivery_id: Optional[str] = None

class AlertStatisticsResponse(BaseModel):
    total_alerts: int
    by_type: dict
    delivery_success_rate: float

# ===== SMS Alerts =====

@router.post("/send-sms", response_model=AlertResponse)
async def send_sms(request: SendAlertRequest, current_user: dict = Depends(get_current_user)):
    """Send SMS alert to a recipient"""
    try:
        service = AlertService()
        
        alert_type = AlertType(request.alert_type)
        success, delivery_id = await service.send_sms(
            phone=request.recipient_phone,
            message=request.message,
            alert_type=alert_type,
            data=request.data,
            user_id=current_user.get("_id"),
            user_role=current_user.get("role")
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send SMS: {delivery_id}"
            )
        
        return AlertResponse(
            success=True,
            message="SMS sent successfully",
            delivery_id=delivery_id
        )
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid alert type"
        )
    except Exception as e:
        logger.error(f"Error sending SMS: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ===== Specific Alert Types =====

@router.post("/sam-detection")
async def alert_sam_detection(
    child_id: str,
    child_name: str,
    mother_phone: str,
    current_user: dict = Depends(get_current_user)
):
    """Alert mother of SAM detection"""
    try:
        service = AlertService()
        success, delivery_id = await service.send_sam_detection_alert(
            child_id=child_id,
            child_name=child_name,
            mother_phone=mother_phone,
            user_id=current_user.get("_id")
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send alert"
            )
        
        return {"success": True, "message": "SAM alert sent", "delivery_id": delivery_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/mam-detection")
async def alert_mam_detection(
    child_id: str,
    child_name: str,
    mother_phone: str,
    current_user: dict = Depends(get_current_user)
):
    """Alert mother of MAM detection"""
    try:
        service = AlertService()
        success, delivery_id = await service.send_mam_detection_alert(
            child_id=child_id,
            child_name=child_name,
            mother_phone=mother_phone,
            user_id=current_user.get("_id")
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send alert"
            )
        
        return {"success": True, "message": "MAM alert sent", "delivery_id": delivery_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/urgent-referral")
async def alert_urgent_referral(
    child_id: str,
    child_name: str,
    nrc_name: str,
    nrc_phone: str,
    current_user: dict = Depends(get_current_user)
):
    """Alert NRC of urgent referral"""
    try:
        service = AlertService()
        success, delivery_id = await service.send_urgent_referral_alert(
            child_id=child_id,
            child_name=child_name,
            nrc_name=nrc_name,
            nrc_phone=nrc_phone,
            user_id=current_user.get("_id")
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send alert"
            )
        
        return {"success": True, "message": "Referral alert sent", "delivery_id": delivery_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/fund-disbursement")
async def alert_fund_disbursement(
    district: str,
    amount: float,
    officer_phone: str,
    current_user: dict = Depends(get_current_user)
):
    """Alert district officer of fund disbursement"""
    try:
        service = AlertService()
        success, delivery_id = await service.send_fund_disbursement_alert(
            district=district,
            amount=amount,
            officer_phone=officer_phone,
            user_id=current_user.get("_id")
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send alert"
            )
        
        return {"success": True, "message": "Fund alert sent", "delivery_id": delivery_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/missed-followup")
async def alert_missed_followup(
    child_id: str,
    child_name: str,
    anganwadi_phone: str,
    current_user: dict = Depends(get_current_user)
):
    """Alert Anganwadi of missed follow-up"""
    try:
        service = AlertService()
        success, delivery_id = await service.send_missed_followup_alert(
            child_id=child_id,
            child_name=child_name,
            anganwadi_phone=anganwadi_phone,
            user_id=current_user.get("_id")
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send alert"
            )
        
        return {"success": True, "message": "Missed followup alert sent", "delivery_id": delivery_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/high-occupancy")
async def alert_high_occupancy(
    nrc_name: str,
    occupancy_percent: float,
    nrc_phone: str,
    current_user: dict = Depends(get_current_user)
):
    """Alert NRC of high bed occupancy"""
    try:
        service = AlertService()
        success, delivery_id = await service.send_high_occupancy_alert(
            nrc_name=nrc_name,
            occupancy_percent=occupancy_percent,
            nrc_phone=nrc_phone,
            user_id=current_user.get("_id")
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send alert"
            )
        
        return {"success": True, "message": "Occupancy alert sent", "delivery_id": delivery_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# ===== Alert History & Analytics =====

@router.get("/my-alerts")
async def get_my_alerts(
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get alerts sent to current user's phone"""
    try:
        service = AlertService()
        alerts = await service.get_alerts_for_user(
            user_phone=current_user.get("phone"),
            limit=limit
        )
        
        return {"success": True, "count": len(alerts), "alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/by-type/{alert_type}")
async def get_alerts_by_type(
    alert_type: str,
    limit: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(get_current_user)
):
    """Get alerts by type for analytics"""
    try:
        service = AlertService()
        alerts = await service.get_alerts_by_type(
            alert_type=AlertType(alert_type),
            limit=limit
        )
        
        return {"success": True, "count": len(alerts), "alerts": alerts}
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid alert type"
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/statistics", response_model=AlertStatisticsResponse)
async def get_alert_statistics(current_user: dict = Depends(get_current_user)):
    """Get alert statistics for dashboard"""
    try:
        service = AlertService()
        stats = await service.get_alert_statistics()
        
        total = sum([s.get("count", 0) for s in stats])
        sent = sum([s.get("sent", 0) for s in stats])
        
        success_rate = (sent / total * 100) if total > 0 else 0
        
        by_type = {s.get("_id"): s.get("count", 0) for s in stats}
        
        return AlertStatisticsResponse(
            total_alerts=total,
            by_type=by_type,
            delivery_success_rate=success_rate
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
