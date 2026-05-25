from datetime import datetime
from typing import Optional
from enum import Enum

class TransactionStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    COMPLETED = "completed"
    FAILED = "failed"

class TransactionType(str, Enum):
    PURCHASE = "purchase"
    DELIVERY = "delivery"
    USAGE = "usage"
    FUND_ALLOCATION = "fund_allocation"

class Transaction:
    def __init__(
        self,
        transaction_id: str,
        type: TransactionType,
        amount: float,
        nrc_id: str,
        description: str,
        status: TransactionStatus = TransactionStatus.PENDING,
        blockchain_hash: Optional[str] = None,
        timestamp: Optional[datetime] = None,
        created_at: Optional[datetime] = None
    ):
        self.transaction_id = transaction_id
        self.type = type
        self.amount = amount
        self.nrc_id = nrc_id
        self.description = description
        self.status = status
        self.blockchain_hash = blockchain_hash
        self.timestamp = timestamp or datetime.utcnow()
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "transaction_id": self.transaction_id,
            "type": self.type,
            "amount": self.amount,
            "nrc_id": self.nrc_id,
            "description": self.description,
            "status": self.status,
            "blockchain_hash": self.blockchain_hash,
            "timestamp": self.timestamp,
            "created_at": self.created_at
        }
