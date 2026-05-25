from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.services.child_service import ChildService
from app.services.nrc_service import NRCService
from app.services.blockchain_service import BlockchainService
from app.database import get_db
from app.middleware.auth import get_current_user, require_role
from datetime import datetime

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Reports"])

@router.get("/dashboard")
async def get_dashboard(
    current_user: dict = Depends(get_current_user)
):
    """Get dashboard analytics"""
    db = get_db()
    
    try:
        # Get statistics
        total_children = await db.children.count_documents({})
        healthy = await db.children.count_documents({"health_status": "healthy"})
        mam = await db.children.count_documents({"health_status": "mam"})
        sam = await db.children.count_documents({"health_status": "sam"})
        
        # Calculate recovery percentage
        discharged = await db.admissions.count_documents({"status": "discharged"})
        recovery_percentage = (discharged / total_children * 100) if total_children > 0 else 0
        
        # NRC occupancy
        nrc_stats = await db.nrc_centers.aggregate([
            {
                "$group": {
                    "_id": None,
                    "total_beds": {"$sum": "$total_beds"},
                    "occupied_beds": {"$sum": "$occupied_beds"}
                }
            }
        ]).to_list(1)
        
        if nrc_stats:
            nrc_occupancy = nrc_stats[0]["occupied_beds"]
            nrc_total_beds = nrc_stats[0]["total_beds"]
        else:
            nrc_occupancy = 0
            nrc_total_beds = 0
        
        # Pending followups
        pending_followups = await db.children.count_documents(
            {"next_followup_date": {"$lte": datetime.utcnow()}}
        )
        
        # High-risk children
        high_risk = await db.children.count_documents({"health_status": "sam"})
        
        # Fund stats
        funds_stats = await db.funds.aggregate([
            {
                "$group": {
                    "_id": None,
                    "total_allocated": {"$sum": "$allocated_amount"},
                    "total_spent": {"$sum": "$spent_amount"}
                }
            }
        ]).to_list(1)
        
        if funds_stats:
            total_funds = funds_stats[0]["total_allocated"]
            funds_utilized = funds_stats[0]["total_spent"]
        else:
            total_funds = 0
            funds_utilized = 0
        
        return {
            "timestamp": datetime.utcnow(),
            "total_children": total_children,
            "healthy_children": healthy,
            "mam_children": mam,
            "sam_children": sam,
            "recovery_percentage": round(recovery_percentage, 2),
            "total_funds": total_funds,
            "funds_utilized": funds_utilized,
            "nrc_occupancy": nrc_occupancy,
            "nrc_total_beds": nrc_total_beds,
            "pending_followups": pending_followups,
            "high_risk_children": high_risk
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/district/{district}")
async def get_district_analytics(
    district: str,
    current_user: dict = Depends(require_role("district_officer", "state_admin"))
):
    """Get district-level analytics"""
    db = get_db()
    
    try:
        total_children = await db.children.count_documents({"district": district})
        healthy = await db.children.count_documents({"district": district, "health_status": "healthy"})
        mam = await db.children.count_documents({"district": district, "health_status": "mam"})
        sam = await db.children.count_documents({"district": district, "health_status": "sam"})
        
        return {
            "district": district,
            "total_children": total_children,
            "healthy": healthy,
            "mam": mam,
            "sam": sam,
            "malnutrition_percentage": ((mam + sam) / total_children * 100) if total_children > 0 else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/state")
async def get_state_analytics(
    current_user: dict = Depends(require_role("state_admin"))
):
    """Get state-level analytics"""
    db = get_db()
    
    try:
        # District-wise breakdown
        districts = await db.children.distinct("district")
        district_stats = []
        
        for district in districts:
            total = await db.children.count_documents({"district": district})
            sam_count = await db.children.count_documents({"district": district, "health_status": "sam"})
            
            district_stats.append({
                "district": district,
                "total_children": total,
                "sam_cases": sam_count,
                "malnutrition_rate": (sam_count / total * 100) if total > 0 else 0
            })
        
        # Sort by SAM rate
        district_stats.sort(key=lambda x: x["malnutrition_rate"], reverse=True)
        
        return {
            "timestamp": datetime.utcnow(),
            "total_districts": len(districts),
            "district_stats": district_stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/nrc/{nrc_id}/performance")
async def get_nrc_performance(
    nrc_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get NRC performance metrics"""
    db = get_db()
    
    try:
        # Get admissions stats
        total_admissions = await db.admissions.count_documents({"nrc_id": nrc_id})
        discharged = await db.admissions.count_documents({"nrc_id": nrc_id, "status": "discharged"})
        under_treatment = await db.admissions.count_documents({"nrc_id": nrc_id, "status": "under_treatment"})
        
        # Average recovery percentage
        recovery_pipeline = [
            {"$match": {"nrc_id": nrc_id, "status": "discharged"}},
            {"$group": {"_id": None, "avg_recovery": {"$avg": "$recovery_percentage"}}}
        ]
        
        recovery_result = await db.admissions.aggregate(recovery_pipeline).to_list(1)
        avg_recovery = recovery_result[0]["avg_recovery"] if recovery_result else 0
        
        return {
            "nrc_id": nrc_id,
            "total_admissions": total_admissions,
            "discharged": discharged,
            "under_treatment": under_treatment,
            "average_recovery_percentage": round(avg_recovery, 2),
            "recovery_rate": (discharged / total_admissions * 100) if total_admissions > 0 else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
