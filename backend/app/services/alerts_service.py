from typing import Optional, Tuple
from app.config import settings
from app.models.alert import Alert, AlertType, AlertStatus
from app.database import get_db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class AlertService:
    """Handle SMS and push notifications for all stakeholders"""
    
    def __init__(self):
        self.twilio_client = self._init_twilio()
    
    def _init_twilio(self):
        """Initialize Twilio client if credentials provided"""
        try:
            if settings.twilio_account_sid and settings.twilio_auth_token:
                from twilio.rest import Client
                return Client(settings.twilio_account_sid, settings.twilio_auth_token)
        except Exception as e:
            logger.warning(f"Twilio not initialized: {e}")
        return None
    
    async def send_sms(
        self,
        phone: str,
        message: str,
        alert_type: AlertType,
        data: dict,
        user_id: Optional[str] = None,
        user_role: Optional[str] = None
    ) -> Tuple[bool, str]:
        """Send SMS via Twilio"""
        try:
            if not self.twilio_client or not settings.twilio_phone_number:
                logger.warning("Twilio not configured, logging alert instead")
                return await self._log_alert(
                    phone, alert_type, message, data, user_id, user_role
                )
            
            # Send SMS
            message_obj = self.twilio_client.messages.create(
                body=message,
                from_=settings.twilio_phone_number,
                to=phone
            )
            
            # Log alert in database
            db = get_db()
            alert = Alert(
                recipient_phone=phone,
                recipient_id=user_id,
                recipient_role=user_role,
                alert_type=alert_type,
                title=self._get_alert_title(alert_type),
                message=message,
                data=data,
                status=AlertStatus.SENT,
                delivery_channel="sms",
                sent_at=datetime.utcnow(),
                delivery_id=message_obj.sid
            )
            
            await db.alerts.insert_one(alert.to_dict())
            
            return True, message_obj.sid
            
        except Exception as e:
            logger.error(f"Failed to send SMS to {phone}: {e}")
            return False, str(e)
    
    async def _log_alert(
        self,
        phone: str,
        alert_type: AlertType,
        message: str,
        data: dict,
        user_id: Optional[str] = None,
        user_role: Optional[str] = None
    ) -> Tuple[bool, str]:
        """Log alert to database when SMS provider not available"""
        try:
            db = get_db()
            alert = Alert(
                recipient_phone=phone,
                recipient_id=user_id,
                recipient_role=user_role,
                alert_type=alert_type,
                title=self._get_alert_title(alert_type),
                message=message,
                data=data,
                status=AlertStatus.PENDING,
                delivery_channel="database",
                sent_at=datetime.utcnow()
            )
            
            result = await db.alerts.insert_one(alert.to_dict())
            logger.info(f"Alert logged: {result.inserted_id}")
            
            return True, str(result.inserted_id)
        except Exception as e:
            logger.error(f"Failed to log alert: {e}")
            return False, str(e)
    
    async def send_sam_detection_alert(self, child_id: str, child_name: str, mother_phone: str, user_id: str):
        """Alert mother of SAM (Severe Acute Malnutrition) detection"""
        message = f"🚨 URGENT: {child_name} has been identified with Severe Acute Malnutrition (SAM). Please contact your nearest health center immediately for treatment."
        
        return await self.send_sms(
            phone=mother_phone,
            message=message,
            alert_type=AlertType.SAM_DETECTED,
            data={"child_id": child_id, "child_name": child_name},
            user_id=user_id,
            user_role="parent"
        )
    
    async def send_mam_detection_alert(self, child_id: str, child_name: str, mother_phone: str, user_id: str):
        """Alert mother of MAM (Moderate Acute Malnutrition) detection"""
        message = f"⚠️ {child_name} has been identified with Moderate Acute Malnutrition (MAM). Please ensure nutritious diet and regular monitoring."
        
        return await self.send_sms(
            phone=mother_phone,
            message=message,
            alert_type=AlertType.MAM_DETECTED,
            data={"child_id": child_id, "child_name": child_name},
            user_id=user_id,
            user_role="parent"
        )
    
    async def send_urgent_referral_alert(self, child_id: str, child_name: str, nrc_name: str, nrc_phone: str, user_id: str):
        """Alert NRC of urgent referral"""
        message = f"🏥 URGENT REFERRAL: {child_name} requires immediate admission to {nrc_name}. Please contact +91{nrc_phone} for bed confirmation."
        
        return await self.send_sms(
            phone=nrc_phone,
            message=message,
            alert_type=AlertType.REFERRAL_URGENT,
            data={"child_id": child_id, "nrc_name": nrc_name},
            user_id=user_id,
            user_role="nrc"
        )
    
    async def send_fund_disbursement_alert(self, district: str, amount: float, officer_phone: str, user_id: str):
        """Alert district officer of fund disbursement"""
        message = f"💰 Fund Disbursement: ₹{amount:,.0f} has been allocated to {district} for malnutrition interventions. Check portal for details."
        
        return await self.send_sms(
            phone=officer_phone,
            message=message,
            alert_type=AlertType.FUND_DISBURSEMENT,
            data={"district": district, "amount": amount},
            user_id=user_id,
            user_role="district_officer"
        )
    
    async def send_missed_followup_alert(self, child_id: str, child_name: str, anganwadi_phone: str, user_id: str):
        """Alert Anganwadi of missed follow-up"""
        message = f"⏰ Missed Follow-up: {child_name} missed scheduled health assessment. Please re-schedule immediately."
        
        return await self.send_sms(
            phone=anganwadi_phone,
            message=message,
            alert_type=AlertType.MISSED_FOLLOWUP,
            data={"child_id": child_id, "child_name": child_name},
            user_id=user_id,
            user_role="anganwadi"
        )
    
    async def send_high_occupancy_alert(self, nrc_name: str, occupancy_percent: float, nrc_phone: str, user_id: str):
        """Alert NRC of high bed occupancy"""
        message = f"🛏️ Bed Occupancy Alert: {nrc_name} is at {occupancy_percent:.0f}% capacity. Plan for additional resources."
        
        return await self.send_sms(
            phone=nrc_phone,
            message=message,
            alert_type=AlertType.CENTER_OCCUPANCY,
            data={"nrc_name": nrc_name, "occupancy": occupancy_percent},
            user_id=user_id,
            user_role="nrc"
        )
    
    async def get_alerts_for_user(self, user_phone: str, limit: int = 20):
        """Get recent alerts for a user"""
        try:
            db = get_db()
            alerts = await db.alerts.find(
                {"recipient_phone": user_phone}
            ).sort("created_at", -1).limit(limit).to_list(None)
            for alert in alerts:
                alert["_id"] = str(alert["_id"])

            return alerts
        except Exception as e:
            logger.error(f"Failed to get alerts: {e}")
            return []
    
    async def get_alerts_by_type(self, alert_type: AlertType, limit: int = 50):
        """Get alerts by type for analytics"""
        try:
            db = get_db()
            alerts = await db.alerts.find(
                {"alert_type": alert_type.value}
            ).sort("created_at", -1).limit(limit).to_list(None)

            for alert in alerts:
                alert["_id"] = str(alert["_id"])

            return alerts
        except Exception as e:
            logger.error(f"Failed to get alerts by type: {e}")
            return []
    
    async def get_alert_statistics(self):
        try:
            db = get_db()

            total = await db.alerts.count_documents({})

            sam = await db.alerts.count_documents(
                {"alert_type": "SAM_ALERT"}
            )

            pending = await db.alerts.count_documents(
                {"status": "pending"}
            )

            return [
                {
                    "_id": "SAM_ALERT",
                    "count": sam,
                    "sent": 0,
                    "failed": 0
                }
            ] if total > 0 else []

        except Exception as e:
            logger.error(f"Failed to get alert statistics: {e}")
            return []
    
    @staticmethod
    def _get_alert_title(alert_type: AlertType) -> str:
        """Get human-readable title for alert type"""
        titles = {
            AlertType.SAM_DETECTED: "Severe Malnutrition Alert",
            AlertType.MAM_DETECTED: "Moderate Malnutrition Alert",
            AlertType.FUND_DISBURSEMENT: "Fund Allocation",
            AlertType.REFERRAL_URGENT: "Urgent Referral",
            AlertType.CENTER_OCCUPANCY: "Bed Occupancy Alert",
            AlertType.MISSED_FOLLOWUP: "Missed Follow-up",
            AlertType.ADMIN_NOTIFICATION: "Administrative Notification",
        }
        return titles.get(alert_type, "Notification")

    async def mark_alert_as_read(self, alert_id: str) -> bool:
        """Mark alert as read in the database"""
        try:
            db = get_db()
            from bson import ObjectId
            try:
                oid = ObjectId(alert_id)
            except Exception:
                oid = alert_id
            
            result = await db.alerts.update_one(
                {"_id": oid},
                {"$set": {"status": "read"}}
            )
            if result.matched_count == 0 and isinstance(oid, ObjectId):
                result = await db.alerts.update_one(
                    {"_id": alert_id},
                    {"$set": {"status": "read"}}
                )
            return result.modified_count > 0 or result.matched_count > 0
        except Exception as e:
            logger.error(f"Failed to mark alert as read: {e}")
            return False

    async def mark_all_alerts_as_read(self, user_phone: str) -> bool:
        """Mark all alerts for a user as read in the database"""
        try:
            db = get_db()
            result = await db.alerts.update_many(
                {"recipient_phone": user_phone},
                {"$set": {"status": "read"}}
            )
            return True
        except Exception as e:
            logger.error(f"Failed to mark all alerts as read for {user_phone}: {e}")
            return False

    async def clear_all_alerts(self, user_phone: str) -> bool:
        """Delete all alerts for a user in the database"""
        try:
            db = get_db()
            result = await db.alerts.delete_many(
                {"recipient_phone": user_phone}
            )
            return True
        except Exception as e:
            logger.error(f"Failed to clear all alerts for {user_phone}: {e}")
            return False

    async def delete_alert(self, alert_id: str) -> bool:
        """Delete a single alert from database"""
        try:
            db = get_db()
            from bson import ObjectId
            try:
                oid = ObjectId(alert_id)
            except Exception:
                oid = alert_id
            
            result = await db.alerts.delete_one({"_id": oid})
            if result.deleted_count == 0 and isinstance(oid, ObjectId):
                result = await db.alerts.delete_one({"_id": alert_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Failed to delete alert: {e}")
            return False
