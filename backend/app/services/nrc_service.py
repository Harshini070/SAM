from app.database import get_db
from app.utils.auth import generate_admission_id, generate_transaction_id
from datetime import datetime, timedelta
from typing import Optional, List

class NRCService:
    def __init__(self):
        self.db = get_db()

    async def get_all_centers(self, district: Optional[str] = None) -> List[dict]:
        """Get all NRC centers"""

        query = {}

        if district:
            query["district"] = district

        centers = await self.db.nrc_centers.find(
            query
        ).to_list(None)

        for center in centers:
            center["_id"] = str(center["_id"])

        return centers

    async def get_center_by_id(self, nrc_id: str):
        center = await self.db.nrc_centers.find_one(
            {"nrc_id": nrc_id}
        )

        if center:
            center["_id"] = str(center["_id"])

        return center

    async def get_nearest_center(self, latitude: float, longitude: float, max_distance: int = 50) -> Optional[dict]:
        """Find nearest NRC center with available beds"""
        # Find center with available beds, sorted by distance
        result = await self.db.nrc_centers.find_one(
            {
                "occupied_beds": {"$lt": "$total_beds"},
                "location": {
                    "$near": {
                        "$geometry": {
                            "type": "Point",
                            "coordinates": [longitude, latitude]
                        },
                        "$maxDistance": max_distance * 1000  # Convert km to meters
                    }
                }
            }
        )
        if result:
            result["_id"] = str(result["_id"])

        return result

    async def admit_child(self, child_id: str, nrc_id: str, treatment_notes: str = "") -> dict:
        """Admit child to NRC"""
        admission_id = generate_admission_id()
        
        admission_doc = {
            "admission_id": admission_id,
            "child_id": child_id,
            "nrc_id": nrc_id,
            "status": "admitted",
            "admission_date": datetime.utcnow(),
            "discharge_date": None,
            "treatment_notes": treatment_notes,
            "recovery_percentage": 0.0,
            "created_at": datetime.utcnow()
        }
        
        result = await self.db.admissions.insert_one(admission_doc)
        
        # Increment occupied beds
        await self.db.nrc_centers.update_one(
            {"nrc_id": nrc_id},
            {"$inc": {"occupied_beds": 1}}
        )
        
        # Update child record
        await self.db.children.update_one(
            {"child_id": child_id},
            {"$set": {"nrc_assigned": nrc_id}}
        )
        
        admission_doc["_id"] = str(result.inserted_id)
        return admission_doc

    async def update_admission(self, admission_id: str, status: str, recovery_percentage: Optional[float] = None, treatment_notes: Optional[str] = None) -> dict:
        """Update admission status"""
        update_doc = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if recovery_percentage is not None:
            update_doc["recovery_percentage"] = recovery_percentage
        
        if treatment_notes is not None:
            update_doc["treatment_notes"] = treatment_notes
        
        if status == "discharged":
            update_doc["discharge_date"] = datetime.utcnow()
        
        result = await self.db.admissions.find_one_and_update(
            {"admission_id": admission_id},
            {"$set": update_doc},
            return_document=True
        )
        
        if result and status == "discharged":
            # Decrement occupied beds
            admission = await self.db.admissions.find_one({"admission_id": admission_id})
            await self.db.nrc_centers.update_one(
                {"nrc_id": admission["nrc_id"]},
                {"$inc": {"occupied_beds": -1}}
            )
        
        return result

    async def get_center_occupancy(self, nrc_id: str) -> dict:
        """Get center occupancy details"""
        center = await self.db.nrc_centers.find_one({"nrc_id": nrc_id})
        if not center:
            return None
        
        return {
            "nrc_id": nrc_id,
            "total_beds": center["total_beds"],
            "occupied_beds": center["occupied_beds"],
            "available_beds": center["total_beds"] - center["occupied_beds"],
            "occupancy_percentage": (center["occupied_beds"] / center["total_beds"] * 100)
        }
