from datetime import datetime
from typing import Optional

class Fund:
    def __init__(
        self,
        fund_id: str,
        category: str,  # Therapeutic Foods, Medical Supplies, Staff, Operations, Emergency
        allocated_amount: float,
        spent_amount: float = 0.0,
        district: str = "State",
        fiscal_year: int = 2024,
        updated_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None
    ):
        self.fund_id = fund_id
        self.category = category
        self.allocated_amount = allocated_amount
        self.spent_amount = spent_amount
        self.district = district
        self.fiscal_year = fiscal_year
        self.updated_at = updated_at or datetime.utcnow()
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "fund_id": self.fund_id,
            "category": self.category,
            "allocated_amount": self.allocated_amount,
            "spent_amount": self.spent_amount,
            "available_amount": self.allocated_amount - self.spent_amount,
            "utilization_percentage": (self.spent_amount / self.allocated_amount * 100) if self.allocated_amount > 0 else 0,
            "district": self.district,
            "fiscal_year": self.fiscal_year,
            "updated_at": self.updated_at,
            "created_at": self.created_at
        }
