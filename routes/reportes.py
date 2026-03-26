from fastapi import APIRouter
from routes.mascotas import mascotas_db
from routes.servicios import servicios_db

router = APIRouter(prefix="", tags=["reportes"])

@router.get("/reporte/{correo}")
def reporte_por_usuario(correo: str):
    registros = [m for m in mascotas_db if m["correo_dueno"] == correo]
    servicios = [m["tipo_servicio"] for m in registros]
    # mapear servicios a precio
    precios = {s["nombre"]: s["precio"] for s in servicios_db}
    total_gastado = sum(precios.get(s, 0) for s in servicios)
    return {
        "correo_dueno": correo,
        "cantidad_servicios": len(registros),
        "servicios": servicios,
        "total_gastado": total_gastado,
        "detalles": registros,
    }