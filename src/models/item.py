from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from uuid import UUID, uuid4

class Item(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    nome_item: str = Field(min_length=1, max_length=100, description="Nome do item deve ter entre 1 e 100 caracteres")
    categoria_item: str = Field(min_length=1, max_length=50, description="Nome da categoria deve ter entre 1 e 50 caracteres")
    preco_unitario: float = Field(...,gt=0, description="Preço deve ser maior que zero" )

    @field_validator('preco_unitario')
    def validate_preco_unitario(cls, v):

        decimal_value = Decimal(str(v))
        
        if decimal_value <= 0:
            raise ValueError("O preço unitário deve ser maior que zero")
        
        rounded_value = round(decimal_value, 2)
        return float(rounded_value)

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "nome_item": "Produto Exemplo",
                "categoria_item" : "Categoria Exemplo",
                "preco_unitario": 19.99
            }
        }