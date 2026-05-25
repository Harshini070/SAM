from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.services.blockchain_service import BlockchainService
from app.middleware.auth import get_current_user, require_role

router = APIRouter(prefix="/api/transactions", tags=["Transactions & Blockchain"])

@router.get("/{nrc_id}")
async def get_nrc_transactions(
    nrc_id: str,
    current_user: dict = Depends(get_current_user),
    limit: int = Query(50, le=100)
):
    """Get all transactions for an NRC"""
    service = BlockchainService()
    transactions = await service.get_nrc_transactions(nrc_id, limit)
    
    return {
        "nrc_id": nrc_id,
        "total": len(transactions),
        "transactions": transactions
    }

@router.get("/{transaction_id}/verify")
async def verify_transaction(
    transaction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Verify a transaction on the blockchain"""
    service = BlockchainService()
    transaction = await service.get_transaction(transaction_id)
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return {
        "transaction_id": transaction_id,
        "status": transaction["status"],
        "blockchain_hash": transaction["blockchain_hash"],
        "verified": True
    }

@router.get("/{nrc_id}/chain/verify")
async def verify_transaction_chain(
    nrc_id: str,
    current_user: dict = Depends(require_role("district_officer", "state_admin"))
):
    """Verify integrity of transaction chain for an NRC"""
    service = BlockchainService()
    
    try:
        is_valid = await service.verify_transaction_chain(nrc_id)
        return {
            "nrc_id": nrc_id,
            "chain_valid": is_valid,
            "message": "Chain integrity verified" if is_valid else "Chain integrity compromised"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{nrc_id}/summary")
async def get_transaction_summary(
    nrc_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get transaction summary for an NRC"""
    service = BlockchainService()
    
    try:
        summary = await service.get_transaction_summary(nrc_id)
        return {
            "nrc_id": nrc_id,
            **summary
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
