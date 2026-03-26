from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/mascotas", tags=["mascotas"])

mascotas_db = []

class MascotaRegistro(BaseModel):
    correo_dueno: str
    nombre_mascota: str
    tipo_servicio: str
    fecha: str

@router.post("/registrar-mascota")
def registrar_mascota(mascota: MascotaRegistro):
    nuevo_registro = {
        "correo_dueno": mascota.correo_dueno,
        "nombre_mascota": mascota.nombre_mascota,
        "tipo_servicio": mascota.tipo_servicio,
        "fecha": mascota.fecha,
    }
    mascotas_db.append(nuevo_registro)
    return {"message": "Mascota registrada", "mascota": nuevo_registro}

@router.get("/{correo}")
def listar_mascotas_por_dueno(correo: str):
    mascotas_dueno = [m for m in mascotas_db if m["correo_dueno"] == correo]
    return {"correo_dueno": correo, "registros": mascotas_dueno, "total": len(mascotas_dueno)}
