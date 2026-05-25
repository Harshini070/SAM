from app.database import get_db
from app.utils.auth import generate_transaction_id
from datetime import datetime
from typing import Optional, List
import hashlib
import json

class BlockchainService:
    def __init__(self):
        self.db = get_db()
        self.chain = []

    async def create_transaction(self, transaction_type: str, amount: float, nrc_id: str, description: str) -> dict:
        """Create and log transaction on blockchain"""
        transaction_id = generate_transaction_id()
        
        transaction_doc = {
            "transaction_id": transaction_id,
            "type": transaction_type,
            "amount": amount,
            "nrc_id": nrc_id,
            "description": description,
            "status": "pending",
            "blockchain_hash": None,
            "timestamp": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        
        # Calculate blockchain hash
        hash_input = json.dumps({
            "transaction_id": transaction_id,
            "type": transaction_type,
            "amount": amount,
            "nrc_id": nrc_id,
            "timestamp": str(transaction_doc["timestamp"])
        }, sort_keys=True)
        
        blockchain_hash = hashlib.sha256(hash_input.encode()).hexdigest()
        transaction_doc["blockchain_hash"] = blockchain_hash
        transaction_doc["status"] = "verified"
        
        result = await self.db.transactions.insert_one(transaction_doc)
        transaction_doc["_id"] = str(result.inserted_id)
        
        return transaction_doc

    async def get_transaction(self, transaction_id: str) -> Optional[dict]:
        """Get transaction by ID"""
        return await self.db.transactions.find_one({"transaction_id": transaction_id})

    async def get_nrc_transactions(self, nrc_id: str, limit: int = 50) -> List[dict]:
        """Get all transactions for an NRC"""
        return await self.db.transactions.find(
            {"nrc_id": nrc_id}
        ).sort("timestamp", -1).limit(limit).to_list(None)

    async def verify_transaction_chain(self, nrc_id: str) -> bool:
        """Verify integrity of transaction chain for an NRC"""
        transactions = await self.get_nrc_transactions(nrc_id, limit=1000)
        
        for i, txn in enumerate(transactions):
            # Verify each transaction hash
            hash_input = json.dumps({
                "transaction_id": txn["transaction_id"],
                "type": txn["type"],
                "amount": txn["amount"],
                "nrc_id": txn["nrc_id"],
                "timestamp": str(txn["timestamp"])
            }, sort_keys=True)
            
            expected_hash = hashlib.sha256(hash_input.encode()).hexdigest()
            if txn.get("blockchain_hash") != expected_hash:
                return False
        
        return True

    async def get_transaction_summary(self, nrc_id: str) -> dict:
        """Get transaction summary for an NRC"""
        transactions = await self.get_nrc_transactions(nrc_id, limit=1000)
        
        summary = {
            "total_transactions": len(transactions),
            "total_amount": 0.0,
            "by_type": {},
            "by_status": {}
        }
        
        for txn in transactions:
            summary["total_amount"] += txn["amount"]
            
            # Count by type
            txn_type = txn["type"]
            if txn_type not in summary["by_type"]:
                summary["by_type"][txn_type] = 0
            summary["by_type"][txn_type] += 1
            
            # Count by status
            status = txn["status"]
            if status not in summary["by_status"]:
                summary["by_status"][status] = 0
            summary["by_status"][status] += 1
        
        return summary
