from datetime import datetime
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    PARENT = "parent"
    MITANIN = "mitanin"
    ANGANWADI = "anganwadi"
    PHC = "phc"
    NRC = "nrc"
    DISTRICT_OFFICER = "district_officer"
    STATE_ADMIN = "state_admin"

class User:
    def __init__(
        self,
        phone: str,
        role: UserRole,
        name: str,
        email: Optional[str] = None,
        district: Optional[str] = None,
        center_id: Optional[str] = None,
        password_hash: Optional[str] = None,
        is_active: bool = True,
        created_at: Optional[datetime] = None
    ):
        self.phone = phone
        self.role = role
        self.name = name
        self.email = email
        self.district = district
        self.center_id = center_id  # For Mitanin, Anganwadi, PHC, NRC
        self.password_hash = password_hash
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "phone": self.phone,
            "role": self.role,
            "name": self.name,
            "email": self.email,
            "district": self.district,
            "center_id": self.center_id,
            "is_active": self.is_active,
            "created_at": self.created_at
        }
