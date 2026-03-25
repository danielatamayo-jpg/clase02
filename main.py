from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def saludar():
    return {"message": "Hola! Bienvenido a mi API con FastAPI!"}
@app.get("/bienvenido/{nombre}")
def saludar_persona(nombre: str):
    return {"message": f"Hola {nombre}! que bueno verte por aquí!"}

servicios_db = [
    {"nombre": "consulta", "precio": 50},
    {"nombre": "baño", "precio": 60.0},
    {"nombre": "corte", "precio": 100.0}
]
@app.get("/servicios")
def listar_servicios():
    return {
        "servicios": servicios_db
    }

def servicios():
    return print(servicios_db)

servicios()

@app.post("/agregar-servicio")
def agregar_servicio(nuevo: dict):
    servicios_db.append(nuevo)
    return {
        "message": "Servicio guardado"
     }
