from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.requests import NRCAdmissionRequest, NRCAdmissionUpdateRequest
from app.services.nrc_service import NRCService
from app.middleware.auth import get_current_user, require_role

router = APIRouter(prefix="/api/nrc", tags=["NRC"])

@router.get("/centers")
async def get_nrc_centers(
    district: str = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get NRC centers"""
    service = NRCService()
    centers = await service.get_all_centers(district)
    
    return {
        "total": len(centers),
        "centers": centers
    }

@router.get("/centers/{nrc_id}")
async def get_nrc_center(
    nrc_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get NRC center details"""
    service = NRCService()
    center = await service.get_center_by_id(nrc_id)
    
    if not center:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NRC center not found"
        )
    
    return center

@router.get("/centers/{nrc_id}/occupancy")
async def get_center_occupancy(
    nrc_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get NRC center occupancy"""
    service = NRCService()
    occupancy = await service.get_center_occupancy(nrc_id)
    
    if not occupancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NRC center not found"
        )
    
    return occupancy

@router.post("/admit")
async def admit_child_to_nrc(
    request: NRCAdmissionRequest,
    current_user: dict = Depends(require_role("mitanin", "phc", "nrc"))
):
    """Admit child to NRC"""
    service = NRCService()
    
    try:
        admission = await service.admit_child(
            request.child_id,
            request.nrc_id,
            request.treatment_notes
        )
        return admission
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/admissions/{admission_id}")
async def update_admission(
    admission_id: str,
    request: NRCAdmissionUpdateRequest,
    current_user: dict = Depends(require_role("nrc", "phc"))
):
    """Update NRC admission status"""
    service = NRCService()
    
    try:
        admission = await service.update_admission(
            admission_id,
            request.status,
            request.recovery_percentage,
            request.treatment_notes
        )
        
        if not admission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admission not found"
            )
        
        return admission
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/nearest")
async def get_nearest_nrc(
    latitude: float = Query(...),
    longitude: float = Query(...),
    current_user: dict = Depends(get_current_user)
):
    """Find nearest available NRC"""
    service = NRCService()
    center = await service.get_nearest_center(latitude, longitude)
    
    if not center:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No available NRC found nearby"
        )
    
    return center
