from fastapi import FastAPI
from app.routes import auth, children, analytics, alerts, nrc, transactions
from app.database import connect_db, disconnect_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NRC e-Governance API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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