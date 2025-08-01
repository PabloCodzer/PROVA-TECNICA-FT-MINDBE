from typing import List, Optional
from uuid import UUID
from motor.motor_asyncio import AsyncIOMotorClient
from models.item import  Item
from core.config import settings

class ItemRepo:
    def __init__(self):
        self.url = settings.MONGODB_URL
        self.dbname = settings.MONGODB_DB_NAME

        self.client = AsyncIOMotorClient(
            self.url,
            uuidRepresentation='standard'
        )
        self.db = self.client[self.dbname]
        self.collection = self.db[settings.MONGODB_COLLECTION_ITENS]

    async def listar_items(
        self,
        nome_item: Optional[str] = None,
        categoria_item: Optional[str] = None,
        preco_unitario: Optional[float] = None,
        skip: int = 0,
        limit: int = 10
    ) -> List[Item]:
        query = {}
        
        if nome_item:
            query["nome_cliente"] = {"$regex": nome_item, "$options": "i"}
        
        if categoria_item:
            query["email_cliente"] = categoria_item.lower()
        
        cursor = self.collection.find(query).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)

        lista_items = []
        for item in items:
            lista_items.append(Item.model_validate(item))
        return lista_items
    

    async def criar_item(self, item: Item) -> Item:
        item_dict = item.model_dump(by_alias=True)  # converte para o modelo que sera inserido no banco
        result = await self.collection.insert_one(item_dict)
        
        if result.inserted_id:
            return item
        raise Exception("Falha ao criar item")
    
    async def obter_item(self, item_id: UUID) -> Optional[Item]:
        item = await self.collection.find_one({"id": item_id})
        return Item.model_validate(item) if item else None
    
    async def deletar_item(self, item_id: UUID) -> bool:
        result = await self.collection.delete_one({"id": item_id})
        return result.deleted_count > 0