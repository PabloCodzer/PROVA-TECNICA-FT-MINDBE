import os
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb+srv://cozer:woNC4CuCWtL8TUtY@fs-py-mindbe.ltaalgy.mongodb.net/?retryWrites=true&w=majority&appName=FS-Py-MindBe"
    MONGODB_DB_NAME: str ="ecommerce"
    MONGODB_COLLECTION_PEDIDOS: str ="pedidos"
    MONGODB_COLLECTION_ITENS: str = "itens"

    def ping(self):
        client = MongoClient(self.MONGODB_URL)
        try:
            client.admin.command('ping')
            print("Successfully connected to MongoDB!")
        except Exception as e:
            print(e)

settings = Settings()