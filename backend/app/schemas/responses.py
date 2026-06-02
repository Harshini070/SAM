from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserResponse(BaseModel):
    phone: str
    name: str
    role: str
    district: Optional[str]
    is_active: bool
    created_at: datetime

class ChildResponse(BaseModel):
    child_id: str
    name: str
    dob: datetime
    gender: str
    mother_phone: str
    village: str
    district: str
    weight: Optional[float]
    height: Optional[float]
    muac: Optional[float]
    health_status: str
    nrc_assigned: Optional[str]
    last_screening_date: Optional[datetime]
    next_followup_date: Optional[datetime]
    growth_history: Optional[List[dict]] = None

class ScreeningResponse(BaseModel):
    child_id: str
    bmi: float
    status: str
    risk_level: str
    recommendation: str
    predicted_at: datetime

class NRCCenterResponse(BaseModel):
    nrc_id: str
    name: str
    district: str
    address: str
    phone: str
    total_beds: int
    occupied_beds: int
    available_beds: int
    staff_count: int
    latitude: Optional[float]
    longitude: Optional[float]

class NRCAdmissionResponse(BaseModel):
    admission_id: str
    child_id: str
    nrc_id: str
    status: str
    admission_date: datetime
    discharge_date: Optional[datetime]
    recovery_percentage: float
    treatment_notes: str

class TransactionResponse(BaseModel):
    transaction_id: str
    type: str
    amount: float
    nrc_id: str
    description: str
    status: str
    blockchain_hash: Optional[str]
    timestamp: datetime

class FundResponse(BaseModel):
    fund_id: str
    category: str
    allocated_amount: float
    spent_amount: float
    available_amount: float
    utilization_percentage: float
    district: str
    fiscal_year: int

class DashboardResponse(BaseModel):
    total_children: int
    healthy_children: int
    mam_children: int
    sam_children: int
    recovery_percentage: float
    total_funds: float
    funds_utilized: float
    nrc_occupancy: int
    nrc_total_beds: int
    pending_followups: int
    high_risk_children: int

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
