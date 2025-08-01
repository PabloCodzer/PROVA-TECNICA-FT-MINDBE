from typing import List, Optional
from datetime import datetime
from uuid import UUID
from models.pedido import Pedido
from repositories.pedido_repo import PedidoRepo

class PedidoUseCases:
    def __init__(self, repository: PedidoRepo):
        self.repository = repository
    
    async def criar_pedido(self, pedido: Pedido) -> Pedido:
        return await self.repository.criar_pedido(pedido)
    
    async def listar_pedidos(
        self,
        nome_cliente: Optional[str] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        pagina: int = 1,
        por_pagina: int = 10
    ) -> List[Pedido]:
        skip = (pagina - 1) * por_pagina
        return await self.repository.listar_pedidos(
            nome_cliente=nome_cliente,
            data_inicio=data_inicio,
            data_fim=data_fim,
            skip=skip,
            limit=por_pagina
        )
    
    async def obter_pedido(self, pedido_id: UUID) -> Optional[Pedido]:
        print(pedido_id)
        return await self.repository.obter_pedido(pedido_id)
    
    async def deletar_pedido(self, pedido_id: UUID) -> bool:
        return await self.repository.deletar_pedido(pedido_id)