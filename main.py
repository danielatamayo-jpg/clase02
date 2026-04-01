from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.servicios import router as servicios_router
from routes.auth import router as auth_router
from routes.mascotas import router as mascotas_router
from routes.reportes import router as reportes_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def saludar():
    return {"message": "Hola! Bienvenido a mi API con FastAPI!"}

@app.get("/bienvenido/{nombre}")
def saludar_persona(nombre: str):
    return {"message": f"Hola {nombre}! que bueno verte por aquí!"}

app.include_router(servicios_router)
app.include_router(auth_router)
app.include_router(mascotas_router)
app.include_router(reportes_router)

