from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, date 
from uuid import UUID
from typing import List, Optional
from models.pedido import Pedido
from services.pedido_service import PedidoUseCases
from repositories.pedido_repo import PedidoRepo


router = APIRouter(prefix="/pedidos", tags=["pedidos"])

def get_use_cases() -> PedidoUseCases:
    repository = PedidoRepo()
    return PedidoUseCases(repository)

@router.get("/")
async def listar_pedidos(
    nome_cliente: Optional[str] = Query(None),
    data_inicio: Optional[datetime] = Query(None),
    data_fim: Optional[datetime] = Query(None),
    pagina: int = Query(1, gt=0),
    por_pagina: int = Query(10, gt=0, le=100),
    use_cases: PedidoUseCases = Depends(get_use_cases)
):
    return await use_cases.listar_pedidos(
        nome_cliente=nome_cliente,
        data_inicio=data_inicio,
        data_fim=data_fim,
        pagina=pagina,
        por_pagina=por_pagina
    )

@router.post("/", response_model=Pedido, status_code=201)
async def criar_pedido(pedido: Pedido, use_cases: PedidoUseCases = Depends(get_use_cases)):
    return await use_cases.criar_pedido(pedido)

@router.get("/{pedido_id}", response_model=Pedido)
async def obter_pedido(pedido_id: UUID, use_cases: PedidoUseCases = Depends(get_use_cases)):
    
    pedido = await use_cases.obter_pedido(pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return pedido

@router.delete("/{pedido_id}", status_code=204)
async def deletar_pedido(pedido_id: UUID, use_cases: PedidoUseCases = Depends(get_use_cases)):
    success = await use_cases.deletar_pedido(pedido_id)
    if not success:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

