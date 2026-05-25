@echo off
REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please update .env with your configuration
)

REM Start the backend server
echo Starting FastAPI server...
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
