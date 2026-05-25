from datetime import datetime
from typing import Optional, List
from enum import Enum

class AdmissionStatus(str, Enum):
    ADMITTED = "admitted"
    UNDER_TREATMENT = "under_treatment"
    RECOVERING = "recovering"
    DISCHARGED = "discharged"

class NRCCenter:
    def __init__(
        self,
        nrc_id: str,
        name: str,
        district: str,
        address: str,
        phone: str,
        total_beds: int,
        occupied_beds: int = 0,
        staff_count: int = 0,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        created_at: Optional[datetime] = None
    ):
        self.nrc_id = nrc_id
        self.name = name
        self.district = district
        self.address = address
        self.phone = phone
        self.total_beds = total_beds
        self.occupied_beds = occupied_beds
        self.staff_count = staff_count
        self.latitude = latitude
        self.longitude = longitude
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "nrc_id": self.nrc_id,
            "name": self.name,
            "district": self.district,
            "address": self.address,
            "phone": self.phone,
            "total_beds": self.total_beds,
            "occupied_beds": self.occupied_beds,
            "available_beds": self.total_beds - self.occupied_beds,
            "staff_count": self.staff_count,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "created_at": self.created_at
        }

class NRCAdmission:
    def __init__(
        self,
        admission_id: str,
        child_id: str,
        nrc_id: str,
        status: AdmissionStatus = AdmissionStatus.ADMITTED,
        admission_date: Optional[datetime] = None,
        discharge_date: Optional[datetime] = None,
        treatment_notes: str = "",
        recovery_percentage: float = 0.0,
        created_at: Optional[datetime] = None
    ):
        self.admission_id = admission_id
        self.child_id = child_id
        self.nrc_id = nrc_id
        self.status = status
        self.admission_date = admission_date or datetime.utcnow()
        self.discharge_date = discharge_date
        self.treatment_notes = treatment_notes
        self.recovery_percentage = recovery_percentage
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "admission_id": self.admission_id,
            "child_id": self.child_id,
            "nrc_id": self.nrc_id,
            "status": self.status,
            "admission_date": self.admission_date,
            "discharge_date": self.discharge_date,
            "treatment_notes": self.treatment_notes,
            "recovery_percentage": self.recovery_percentage,
            "created_at": self.created_at
        }
