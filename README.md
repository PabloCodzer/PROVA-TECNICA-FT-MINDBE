# Sistema de Pedidos E-commerce

Aplicação fullstack para gestão de pedidos em e-commerce com FastAPI, MongoDB e HTMX.
Prova Técnica – Desenvolvedor 
Fullstack Python (Pleno)

## 🚀 Tecnologias
- **Backend**: FastAPI (Python 3.11)
- **Frontend**: Jinja2 + HTMX + Bulma CSS + Javascript
- **Banco de Dados**: MongoDB
- **Infraestrutura**: Docker

## 📋 Pré-requisitos
- Docker e Docker Compose
- 1GB de RAM livre
- 2 vCPUs (recomendado)

## 🛠️ Configuração

🔍 Comandos Úteis
###🐳 1. Construir a imagem e rodar
### docker build -t ecommerce-pedidos .
### docker run -p 8000:8000 mindbe-ecommerce:latest


## 🏗️ Estrutura do Projeto
```markdown
- /app
  - main.py
  - requirements.txt
  - /src
    - /core
    - /domain
    - /repositories
    - /routes
    - /templates
    - /usecases

## 📌 Observações
### Banco Mongo usado foi a versão MongoDb Atlas
