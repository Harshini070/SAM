from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.schemas.requests import ChildRegistrationRequest, ScreeningRequest
from app.schemas.responses import ChildResponse, ScreeningResponse
from app.services.child_service import ChildService
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/children", tags=["Children"])

@router.post("/register", response_model=ChildResponse)
async def register_child(
    request: ChildRegistrationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Register a new child (Parent/Mitanin can do this)"""
    service = ChildService()
    
    try:
        child = await service.register_child(request.dict())
        return ChildResponse(**child)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/screen")
async def screen_child(
    request: ScreeningRequest,
    current_user: dict = Depends(get_current_user)
):
    """Screen child and predict health status"""
    service = ChildService()
    
    try:
        result = await service.screen_child(
            request.child_id,
            request.weight,
            request.height,
            request.muac,
            request.age_months
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/by-mother/{mother_phone}")
async def get_children_by_mother(
    mother_phone: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all children for a mother (Parent access)"""
    # Verify the parent is accessing their own children
    if current_user["role"] == "parent" and current_user["phone"] != mother_phone:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other parent's children"
        )
    
    service = ChildService()
    children = await service.get_children_by_mother_phone(mother_phone)
    
    return {
        "count": len(children),
        "children": children
    }

@router.get("/{child_id}")
async def get_child(
    child_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get child details"""
    service = ChildService()
    child = await service.get_child(child_id)
    
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    return child

@router.get("/by-district/{district}")
async def get_children_by_district(
    district: str,
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0),
    limit: int = Query(50, le=100)
):
    """Get children in a district (Mitanin/Anganwadi/PHC can access)"""
    allowed_roles = ["mitanin", "anganwadi", "phc", "district_officer", "state_admin"]
    if current_user["role"] not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    service = ChildService()
    children = await service.get_children_by_district(district)
    
    return {
        "total": len(children),
        "count": len(children[skip:skip+limit]),
        "children": children[skip:skip+limit]
    }

@router.get("/high-risk/list")
async def get_high_risk_children(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(20, le=100)
):
    """Get high-risk children (SAM cases)"""
    service = ChildService()
    children = await service.get_high_risk_children(limit)
    
    return {
        "count": len(children),
        "children": children
    }

@router.get("/pending-followups/list")
async def get_pending_followups(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(20, le=100)
):
    """Get children with pending followups"""
    service = ChildService()
    children = await service.get_pending_followups(limit)
    
    return {
        "count": len(children),
        "children": children
    }
