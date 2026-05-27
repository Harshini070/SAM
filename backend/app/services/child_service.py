from app.database import get_db
from app.utils.auth import generate_child_id
from app.utils.prediction import predict_health_status
from datetime import datetime, timedelta
from typing import Optional, List

class ChildService:
    def __init__(self):
        self.db = get_db()

    async def register_child(self, data: dict) -> dict:
        child_id = generate_child_id()

    # Calculate age in months
        age_months = (
            (datetime.utcnow().year - data["dob"].year) * 12 +
            (datetime.utcnow().month - data["dob"].month)
            )

        prediction = predict_health_status(
            data["weight"],
            data["height"],
            age_months
        )
        # Auto assign NRC for SAM children
        nrc_assigned = None

        if prediction["status"] == "sam":
            nrc = await self.db.nrc_centers.find_one(
                {"district": data["district"]}
            )

            if nrc:
                nrc_assigned = nrc["nrc_id"]

                # Create alert
                alert_doc = {
                    "recipient_phone": data["mother_phone"],
                    "alert_type": "SAM_ALERT",

                    "message":
                        f"Child {data['name']} identified as SAM and assigned to {nrc['name']}",

                    "status": "pending",

                    "created_at": datetime.utcnow()
                }

                await self.db.alerts.insert_one(alert_doc)
    
        next_followup = (
            datetime.utcnow() + timedelta(days=30)
            if prediction["status"] == "healthy"
            else datetime.utcnow() + timedelta(days=15)
        )

        child_doc = {
            "child_id": child_id,
            "name": data["name"],
            "dob": data["dob"],
            "gender": data["gender"],
            "mother_name": data["mother_name"],
            "mother_phone": data["mother_phone"],
            "village": data["village"],
            "district": data["district"],

            "weight": data["weight"],
            "height": data["height"],
            "muac": data["muac"],

            "health_status": prediction["status"],
            "last_screening_date": datetime.utcnow(),
            "next_followup_date": next_followup,

            "nrc_assigned": nrc_assigned,
            

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

    async def get_children_by_mother_phone(self, mother_phone: str):
        children = await self.db.children.find(
            {"mother_phone": mother_phone}
        ).to_list(None)

        for child in children:
            child["_id"] = str(child["_id"])

        return children


    async def get_children_by_district(self, district: str):
        children = await self.db.children.find(
            {"district": district}
        ).to_list(None)

        for child in children:
            child["_id"] = str(child["_id"])

        return children

    async def get_high_risk_children(self, limit: int = 10) -> List[dict]:
        """Get high-risk children (SAM status)"""
        children = await self.db.children.find(
            {"health_status":"sam"}
        ).limit(limit).to_list(None)

        for child in children:
            child["_id"] = str(child["_id"])

        return children

    async def get_pending_followups(self, limit: int = 10):
        children = await self.db.children.find(
            {"next_followup_date":
                {"$lte": datetime.utcnow()}
            }
        ).limit(limit).to_list(None)

        for child in children:
            child["_id"] = str(child["_id"])

        return children
