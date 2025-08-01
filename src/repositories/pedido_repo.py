from typing import List, Optional
from uuid import UUID
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from models.pedido import Pedido
from core.config import settings

class PedidoRepo:
    def __init__(self):
        self.url = settings.MONGODB_URL
        self.dbname = settings.MONGODB_DB_NAME

        self.client = AsyncIOMotorClient(
            self.url,
            uuidRepresentation='standard'
        )
        self.db = self.client[self.dbname]
        self.collection = self.db[settings.MONGODB_COLLECTION_PEDIDOS]
    
    async def criar_pedido(self, pedido: Pedido) -> Pedido:

        pedido_dict = pedido.model_dump(by_alias=True)  # converte para o modelo que sera inserido no banco
        result = await self.collection.insert_one(pedido_dict)
        
        if result.inserted_id:
            return pedido
        raise Exception("Falha ao criar pedido")
    
    async def obter_pedido_por_id(self, pedido_id: UUID) -> Optional[Pedido]:
        pedido = await self.collection.find_one({"id": pedido_id})
        if pedido is None:
            return None
        return Pedido.model_validate(pedido)
    
    async def listar_pedidos(
        self,
        nome_cliente: Optional[str] = None,
        email_cliente: Optional[str] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 10
    ) -> List[Pedido]:
        query = {}
        
        if nome_cliente:
            query["nome_cliente"] = {"$regex": nome_cliente, "$options": "i"}
        
        if email_cliente:
            query["email_cliente"] = email_cliente.lower()
        
        if data_inicio and data_fim:
            query["data_pedido"] = {"$gte": data_inicio, "$lte": data_fim}
        elif data_inicio:
            query["data_pedido"] = {"$gte": data_inicio}
        elif data_fim:
            query["data_pedido"] = {"$lte": data_fim}
        
        cursor = self.collection.find(query).skip(skip).limit(limit)
        pedidos = await cursor.to_list(length=limit)

        lista_pedidos = []
        for pedido in pedidos:
            lista_pedidos.append(Pedido.model_validate(pedido))
        return lista_pedidos

    async def obter_pedido(self, pedido_id: UUID) -> Optional[Pedido]:
        pedido = await self.collection.find_one({"id": pedido_id})
        return Pedido.model_validate(pedido) if pedido else None
    
    async def deletar_pedido(self, pedido_id: UUID) -> bool:
        result = await self.collection.delete_one({"id": pedido_id})
        return result.deleted_count > 0