from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    
    mongodb_url: str = "mongodb+srv://nrcadmin:nrc123@nrc-cluster.xhg4k1a.mongodb.net/nrc_db?retryWrites=true&w=majority&appName=nrc-cluster"
    database_name: str = "nrc_db"
    
    # JWT
    secret_key: str = "your-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    refresh_token_expire_days: int = 7
    
    # Twilio
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    
    # OTP
    otp_validity_minutes: int = 10
    otp_length: int = 6
    
    # Blockchain
    blockchain_network: str = "http://localhost:8545"
    private_key: Optional[str] = None
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings()
