from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from uuid import UUID
from typing import List, Optional

from models.item import Item
from services.item_service import ItemUseCases
from repositories.item_repo import ItemRepo


router = APIRouter(prefix="/items", tags=["items"])

def get_use_cases() -> ItemUseCases:
    repository = ItemRepo()
    return ItemUseCases(repository)

@router.get("/")
async def listar_todos_items(

    nome_item: Optional[str] = Query(None),
    categoria_item: Optional[str] = Query(None),
    preco_unitario: Optional[float] =  Query(1, gt=0),
    pagina: int = Query(1, gt=0),
    por_pagina: int = Query(10, gt=0, le=100),
    use_cases: ItemUseCases = Depends(get_use_cases)
):
    return await use_cases.listar_items(
        nome_item=nome_item,
        categoria_item=categoria_item,
        preco_unitario=preco_unitario,
        pagina=pagina,
        por_pagina=por_pagina
    )

@router.post("/", response_model=Item, status_code=201)
async def criar_item(item: Item, use_cases: ItemUseCases = Depends(get_use_cases)):
    return await use_cases.criar_item(item)


@router.get("/{item_id}", response_model=Item)
async def obter_item(item_id: UUID, use_cases: ItemUseCases = Depends(get_use_cases)):
    
    pedido = await use_cases.obter_item(item_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return pedido

@router.delete("/{item_id}", status_code=204)
async def deletar_item(item_id: UUID, use_cases: ItemUseCases = Depends(get_use_cases)):
    success = await use_cases.deletar_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    