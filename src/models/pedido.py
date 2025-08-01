from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from uuid import UUID, uuid4

class ItemPedido(BaseModel):
    nome: str
    quantidade: int = Field(gt=0)
    preco_unitario: float = Field(gt=0)

class Pedido(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    nome_cliente: str
    email_cliente: str
    data_pedido: datetime = Field(default_factory=datetime.now)
    itens: List[ItemPedido]
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "nome_cliente": "João Silva",
                "email_cliente": "joao@example.com",
                "itens": [
                    {"nome": "Camiseta", "quantidade": 2, "preco_unitario": 29.90},
                    {"nome": "Calça Jeans", "quantidade": 1, "preco_unitario": 99.90}
                ]
            }
        }
        json_encoders = {
        datetime: lambda v: v.strftime('%d/%m/%Y')
    }