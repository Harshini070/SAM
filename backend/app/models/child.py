from datetime import datetime
from typing import Optional
from enum import Enum

class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    MAM = "mam"  # Moderate Acute Malnutrition
    SAM = "sam"  # Severe Acute Malnutrition

class Child:
    def __init__(
        self,
        child_id: str,
        name: str,
        dob: datetime,
        gender: str,
        mother_name: str,
        mother_phone: str,
        village: str,
        district: str,
        weight: Optional[float] = None,
        height: Optional[float] = None,
        muac: Optional[float] = None,
        health_status: HealthStatus = HealthStatus.HEALTHY,
        nrc_assigned: Optional[str] = None,
        last_screening_date: Optional[datetime] = None,
        next_followup_date: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.child_id = child_id
        self.name = name
        self.dob = dob
        self.gender = gender
        self.mother_name = mother_name
        self.mother_phone = mother_phone
        self.village = village
        self.district = district
        self.weight = weight
        self.height = height
        self.muac = muac
        self.health_status = health_status
        self.nrc_assigned = nrc_assigned
        self.last_screening_date = last_screening_date
        self.next_followup_date = next_followup_date
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self):
        return {
            "child_id": self.child_id,
            "name": self.name,
            "dob": self.dob,
            "gender": self.gender,
            "mother_name": self.mother_name,
            "mother_phone": self.mother_phone,
            "village": self.village,
            "district": self.district,
            "weight": self.weight,
            "height": self.height,
            "muac": self.muac,
            "health_status": self.health_status,
            "nrc_assigned": self.nrc_assigned,
            "last_screening_date": self.last_screening_date,
            "next_followup_date": self.next_followup_date,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
