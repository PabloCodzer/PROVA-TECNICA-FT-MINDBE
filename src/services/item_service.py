from typing import List, Optional
from datetime import datetime
from uuid import UUID
from models.item import Item
from repositories.item_repo import ItemRepo

class ItemUseCases:
    def __init__(self, repository: ItemRepo):
        self.repository = repository

    async def criar_item(self, item: Item) -> Item:
        return await self.repository.criar_item(item)
    
    async def listar_items(self,
        nome_item: Optional[str] = None,
        categoria_item: Optional[str] = None,
        preco_unitario: Optional[float] = None,
        pagina: int = 1,
        por_pagina: int = 10
    ) -> List[Item]:
        skip = (pagina - 1) * por_pagina
        return await self.repository.listar_items(
            nome_item=nome_item,
            categoria_item=categoria_item,
            preco_unitario=preco_unitario,
            skip=skip,
            limit=por_pagina
        )

    async def obter_item(self, item_id: UUID) -> Optional[ItemRepo]:
        print(item_id)
        return await self.repository.obter_item(item_id)
    
    async def deletar_item(self, item_id: UUID) -> bool:
        return await self.repository.deletar_item(item_id)