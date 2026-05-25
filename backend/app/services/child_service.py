from app.database import get_db
from app.utils.auth import generate_child_id
from app.utils.prediction import predict_health_status
from datetime import datetime, timedelta
from typing import Optional, List

class ChildService:
    def __init__(self):
        self.db = get_db()

    async def register_child(self, data: dict) -> dict:
        """Register a new child"""
        child_id = generate_child_id()
        
        child_doc = {
            "child_id": child_id,
            "name": data["name"],
            "dob": data["dob"],
            "gender": data["gender"],
            "mother_name": data["mother_name"],
            "mother_phone": data["mother_phone"],
            "village": data["village"],
            "district": data["district"],
            "weight": data.get("weight"),
            "height": data.get("height"),
            "muac": data.get("muac"),
            "health_status": "unknown",
            "nrc_assigned": None,
            "last_screening_date": None,
            "next_followup_date": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.db.children.insert_one(child_doc)
        child_doc["_id"] = str(result.inserted_id)
        return child_doc

    async def screen_child(self, child_id: str, weight: float, height: float, muac: float, age_months: int) -> dict:
        """Screen child and predict health status"""
        prediction = predict_health_status(weight, height, age_months)
        
        # Calculate next followup date
        if prediction["status"] == "healthy":
            next_followup = datetime.utcnow() + timedelta(days=30)
        else:
            next_followup = datetime.utcnow() + timedelta(days=15)
        
        # Update child record
        update_doc = {
            "weight": weight,
            "height": height,
            "muac": muac,
            "health_status": prediction["status"],
            "last_screening_date": datetime.utcnow(),
            "next_followup_date": next_followup,
            "updated_at": datetime.utcnow()
        }
        
        await self.db.children.update_one(
            {"child_id": child_id},
            {"$set": update_doc}
        )
        
        return {
            "child_id": child_id,
            **prediction,
            "next_followup_date": next_followup
        }

    async def get_child(self, child_id: str) -> Optional[dict]:
        """Get child by ID"""
        return await self.db.children.find_one({"child_id": child_id})

    async def get_children_by_mother_phone(self, mother_phone: str) -> List[dict]:
        """Get all children for a mother"""
        return await self.db.children.find({"mother_phone": mother_phone}).to_list(None)

    async def get_children_by_district(self, district: str) -> List[dict]:
        """Get all children in a district"""
        return await self.db.children.find({"district": district}).to_list(None)

    async def get_high_risk_children(self, limit: int = 10) -> List[dict]:
        """Get high-risk children (SAM status)"""
        return await self.db.children.find(
            {"health_status": "sam"}
        ).limit(limit).to_list(None)

    async def get_pending_followups(self, limit: int = 10) -> List[dict]:
        """Get children with pending followups"""
        return await self.db.children.find(
            {"next_followup_date": {"$lte": datetime.utcnow()}}
        ).limit(limit).to_list(None)
