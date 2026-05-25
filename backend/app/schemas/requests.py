from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class OTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=10)

class OTPVerifyRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=10)
    code: str = Field(..., min_length=6, max_length=6)

class LoginRequest(BaseModel):
    phone: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class UserRegisterRequest(BaseModel):
    phone: str
    name: str
    role: str
    district: Optional[str] = None
    center_id: Optional[str] = None
    email: Optional[EmailStr] = None

class ChildRegistrationRequest(BaseModel):
    name: str
    dob: datetime
    gender: str
    mother_name: str
    mother_phone: str
    village: str
    district: str
    weight: Optional[float] = None
    height: Optional[float] = None
    muac: Optional[float] = None

class ChildUpdateRequest(BaseModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    muac: Optional[float] = None
    health_status: Optional[str] = None

class ScreeningRequest(BaseModel):
    child_id: str
    weight: float
    height: float
    muac: float
    age_months: int

class NRCAdmissionRequest(BaseModel):
    child_id: str
    nrc_id: str
    treatment_notes: str = ""

class NRCAdmissionUpdateRequest(BaseModel):
    status: str
    recovery_percentage: Optional[float] = None
    treatment_notes: Optional[str] = None
