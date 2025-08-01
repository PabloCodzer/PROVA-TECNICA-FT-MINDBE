from fastapi import FastAPI
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from routers.item_router import router as items_router
from routers.pedidos_router import router as pedidos_router


app = FastAPI(
    title="Sistema de Pedidos E-commerce",
    description="API gerenciamenteo ecommerce Teste Tecnico MindBe",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

app.include_router(items_router)
app.include_router(pedidos_router)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/lista_pedidos")
async def pedidos_template(request: Request):
    return templates.TemplateResponse("pedidos.html", {"request": request})

@app.get("/lista_itens")
async def pedidos_template(request: Request):
    return templates.TemplateResponse("itens.html", {"request": request})

@app.exception_handler(RequestValidationError)
async def handle_validation_errors(request: Request, exc: RequestValidationError):
    # print(exc.errors())
    erros = []
    for error in exc.errors():
        erros.append({
            "field": error["loc"][-1],
            "message": f"verifique o campo {error['loc'][-1]}"
        })
    
    return JSONResponse(
        status_code=422,
        content={"errors": erros},
    )