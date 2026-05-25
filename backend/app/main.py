from fastapi import FastAPI
from app.routes import auth, children, analytics, alerts, nrc, transactions
from app.database import connect_db, disconnect_db

app = FastAPI(
    title="NRC e-Governance API",
    version="1.0.0"
)


@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()


# Routes
app.include_router(auth.router)
app.include_router(children.router)
app.include_router(analytics.router)
app.include_router(alerts.router)
app.include_router(nrc.router)
app.include_router(transactions.router)


@app.get("/")
def root():
    return {"message": "NRC Backend Running"}