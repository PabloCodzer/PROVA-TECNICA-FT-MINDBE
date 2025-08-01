let PedidosdataTable;
let pedidoToDelete = null;

$(document).ready(function() {
    // Inicializa a tabela
    PedidosdataTable = $('#tabelaPedidos').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json'
        },
        responsive: {
            details: {
                display: $.fn.dataTable.Responsive.display.modal({
                    header: function(row) {
                        var data = row.data();
                        return 'Pedido: ' + data[0] + ' - ' + data[1];
                    }
                }),
                renderer: $.fn.dataTable.Responsive.renderer.tableAll({
                    tableClass: 'table'
                })
            }
        },
        pageLength: 10,
        columns: [
            { 
                data: 'id',
                className: 'has-text-centered'
            },
            { 
                data: 'nome_cliente',
                className: 'has-text-weight-semibold'
            },
            { 
                data: 'email_cliente'
            },
            { 
                data: 'data_pedido',
                render: function(data, type, row) {
                    if (type === 'display') {
                        return new Date(data).toLocaleDateString('pt-BR');
                    }
                    return data;
                }
            },
            { 
                data: 'itens',
                render: function(data, type, row) {
                    if (type === 'display') {
                        const itemsHtml = data.map(item => 
                            `<div class="mb-1 preco-cell">
                                ${item.nome} (${item.quantidade} × R$ ${item.preco_unitario.toFixed(2).replace('.', ',')})
                            </div>`
                        ).join('');
                        return `<div class="items-list">${itemsHtml}</div>`;
                    }
                    return data.map(item => `${item.nome} (${item.quantidade})`).join(', ');
                }
            },
            { 
                data: 'itens',
                render: function(data, type, row) {
                    const total = data.reduce((sum, item) => sum + item.quantidade, 0);
                    if (type === 'display') {
                        return total;
                    }
                    return total;
                },
                className: 'has-text-centered'
            },
            { 
                data: 'itens',
                render: function(data, type, row) {
                    const total = data.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
                    if (type === 'display') {
                        return 'R$ ' + total.toFixed(2).replace('.', ',');
                    }
                    return total;
                },
                className: 'has-text-right'
            },
            { 
                data: null,
                sortable: false,
                render: function(data, type, row) {
                    return `
                        <div class="buttons are-small is-centered">
                            <button class="button is-info is-light btn-editar" 
                                    title="Editar" 
                                    data-id="${row.id}"
                                    hx-get="/pedidos/editar/${row.id}" 
                                    hx-target="body">
                                <span class="icon">
                                    <i class="fas fa-edit"></i>
                                </span>
                            </button>
                            <button class="button is-danger is-light btn-excluir" 
                                    title="Excluir" 
                                    data-id="${row.id}">
                                <span class="icon">
                                    <i class="fas fa-trash"></i>
                                </span>
                            </button>
                            <button class="button is-success is-light btn-detalhes" 
                                    title="Detalhes" 
                                    data-id="${row.id}"
                                    hx-get="/pedidos/detalhes/${row.id}" 
                                    hx-target="body">
                                <span class="icon">
                                    <i class="fas fa-eye"></i>
                                </span>
                            </button>
                        </div>
                    `;
                }
            }
        ]
    });

    // Carrega os pedidos
    carregarPedidosManual();

    // Configura o modal de confirmação
    const confirmModal = $('#confirmModal');
    $(document).on('click', '.btn-excluir', function() {
        pedidoToDelete = $(this).data('id');
        confirmModal.addClass('is-active');
    });

    $('#confirmDelete').on('click', function() {
        if (pedidoToDelete) {
            excluirPedido(pedidoToDelete);
        }
        confirmModal.removeClass('is-active');
    });

    $('#cancelDelete, .modal-background, .modal-card-head .delete').on('click', function() {
        confirmModal.removeClass('is-active');
        pedidoToDelete = null;
    });

    // Novo pedido
    $('#btnNovoPedido').on('click', function() {
        // HTMX já cuida disso via hx-get
    });
});

async function carregarPedidosManual() {
    try {
        const response = await fetch('http://127.0.0.1:8000/pedidos/');
        const pedidos = await response.json();
        
        PedidosdataTable.clear();
        PedidosdataTable.rows.add(pedidos).draw();
        
    } catch (error) {
        mostrarNotificacao('Erro ao carregar pedidos: ' + error.message, 'is-danger');
    }
}

async function excluirPedido(id) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/pedidos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            mostrarNotificacao('Pedido excluído com sucesso!', 'is-success');
            carregarPedidosManual();
        } else {
            throw new Error('Falha ao excluir pedido');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao excluir pedido: ' + error.message, 'is-danger');
    }
}

function mostrarNotificacao(mensagem, tipo) {
    // Mapeia os tipos para ícones e títulos do SweetAlert
    const tipoParaConfig = {
        'is-success': {
            icon: 'success',
            title: 'Sucesso!',
            background: '#effaf3',
            color: '#257942'
        },
        'is-danger': {
            icon: 'error',
            title: 'Erro!',
            background: '#feecf0',
            color: '#cc0f35'
        },
        'is-warning': {
            icon: 'warning',
            title: 'Atenção!',
            background: '#fffbeb',
            color: '#946c00'
        },
        'is-info': {
            icon: 'info',
            title: 'Informação',
            background: '#eff5fb',
            color: '#296fa8'
        }
    };

    // Obtém a configuração baseada no tipo ou usa valores padrão
    const config = tipoParaConfig[tipo] || {
        icon: 'info',
        title: 'Notificação'
    };

    Swal.fire({
        icon: config.icon,
        title: config.title,
        text: mensagem,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        background: config.background,
        color: config.color,
        width: '400px'
    });
}
let todosItens = [];
let itensSelecionados = [];

async function carregarItensDisponiveis() {
    try {
        const response = await fetch('http://127.0.0.1:8000/items/');
        if (!response.ok) throw new Error('Erro ao carregar itens');
        todosItens = await response.json();
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Falha ao carregar itens. Tente recarregar a página.', 'is-danger');
        return [];
    }
}

async function mostrarModalNovoPedido() {
    await carregarItensDisponiveis();
    itensSelecionados = [];

    // Cria o HTML para a lista de itens
    const itensHTML = todosItens.map(item => `
        <div class="item-container" style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
            <div style="flex-grow: 1;">
                <strong>${item.nome_item}</strong><br>
                <small>Categoria: ${item.categoria_item}</small><br>
                <small>Preço: R$ ${item.preco_unitario.toFixed(2)}</small>
            </div>
            <input type="number" min="0" value="0" class="quantidade-input" 
                   style="width: 60px; margin-left: 10px;"
                   data-item='${JSON.stringify(item).replace(/'/g, "\\'")}'>
        </div>
    `).join('');

    const { value: formValues } = await Swal.fire({
        title: 'Criar Novo Pedido',
        html: `
            <input id="nome_cliente" class="swal2-input" placeholder="Nome do Cliente" required>
            <input id="email_cliente" class="swal2-input" placeholder="Email do Cliente" type="email" required>
            <h3 style="margin: 15px 0 10px 0;">Itens Disponíveis</h3>
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;">
                ${itensHTML}
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Criar Pedido',
        cancelButtonText: 'Cancelar',
        width: '700px',
        preConfirm: () => {
            const nomeCliente = document.getElementById('nome_cliente').value;
            const emailCliente = document.getElementById('email_cliente').value;
            
            // Coletar itens com quantidade > 0
            const inputs = document.querySelectorAll('.quantidade-input');
            const itens = [];
            
            inputs.forEach(input => {
                const quantidade = parseInt(input.value);
                if (quantidade > 0) {
                    const item = JSON.parse(input.dataset.item);
                    itens.push({
                        nome: item.nome_item,
                        quantidade: quantidade,
                        preco_unitario: item.preco_unitario
                    });
                }
            });

            if (itens.length === 0) {
                Swal.showValidationMessage('Selecione pelo menos um item com quantidade maior que zero');
                return false;
            }

            return {
                nome_cliente: nomeCliente,
                email_cliente: emailCliente,
                itens: itens
            };
        }
    });

    if (formValues) {
        criarPedido(formValues);
    }
}

// Função para criar o pedido (mantida igual)
async function criarPedido(pedidoData) {
    try {
        const response = await fetch('http://127.0.0.1:8000/pedidos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedidoData)
        });

        if (response.ok) {
            mostrarNotificacao('Pedido criado com sucesso!', 'is-success');
            carregarPedidosManual();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar pedido');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao criar pedido: ' + error.message, 'is-danger');
    }
}

// Botao precisa ver um estilo descente....
$('#btnNovoPedido').on('click', mostrarModalNovoPedido);

$(document).on('click', '.btn-editar', async function() {
    const pedidoId = $(this).data('id');
    await mostrarModalEditarPedido(pedidoId);
});

// Função para mostrar o modal de edição
async function mostrarModalEditarPedido(pedidoId) {
    try {
        // Carrega os dados do pedido
        const [pedidoResponse, itensResponse] = await Promise.all([
            fetch(`http://127.0.0.1:8000/pedidos/${pedidoId}`),
            fetch('http://127.0.0.1:8000/items/')
        ]);
        
        if (!pedidoResponse.ok || !itensResponse.ok) {
            throw new Error('Erro ao carregar dados para edição');
        }
        
        const pedido = await pedidoResponse.json();
        const todosItens = await itensResponse.json();
        
        // Mostra o modal de edição
        const { value: formValues } = await Swal.fire({
            title: `Editar Pedido #${pedido.id}`,
            html: `
                <div class="field">
                    <label class="label">Cliente</label>
                    <input id="nome_cliente" class="input swal2-input" 
                           value="${pedido.nome_cliente}" required>
                </div>
                <div class="field">
                    <label class="label">Email</label>
                    <input id="email_cliente" class="input swal2-input" 
                           value="${pedido.email_cliente}" type="email" required>
                </div>
                <div class="field">
                    <label class="label">Itens do Pedido</label>
                    <div style="max-height: 50vh; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                        ${todosItens.map(item => {
                            const itemPedido = pedido.itens.find(i => i.nome === item.nome_item);
                            const quantidade = itemPedido ? itemPedido.quantidade : 0;
                            return `
                                <div class="box" style="margin-bottom: 10px;">
                                    <div class="columns is-vcentered">
                                        <div class="column is-6">
                                            <p><strong>${item.nome_item}</strong></p>
                                            <p class="help">${item.categoria_item}</p>
                                        </div>
                                        <div class="column is-4">
                                            <p class="has-text-weight-semibold">R$ ${item.preco_unitario.toFixed(2)}</p>
                                        </div>
                                        <div class="column is-2">
                                            <input type="number" min="0" value="${quantidade}" 
                                                   class="input quantidade-item" 
                                                   style="width: 100%"
                                                   data-item-id="${item.id}">
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Salvar Alterações',
            cancelButtonText: 'Cancelar',
            width: '800px',
            preConfirm: () => {
                const nome = document.getElementById('nome_cliente').value.trim();
                const email = document.getElementById('email_cliente').value.trim();
                
                if (!nome || !email) {
                    Swal.showValidationMessage('Preencha todos os campos do cliente');
                    return false;
                }
                
                if (!/^\S+@\S+\.\S+$/.test(email)) {
                    Swal.showValidationMessage('Informe um email válido');
                    return false;
                }

                const inputs = document.querySelectorAll('.quantidade-item');
                const itens = Array.from(inputs)
                    .filter(input => parseInt(input.value) > 0)
                    .map(input => {
                        const item = todosItens.find(i => i.id === parseInt(input.dataset.itemId));
                        return {
                            nome: item.nome_item,
                            quantidade: parseInt(input.value),
                            preco_unitario: item.preco_unitario
                        };
                    });

                if (itens.length === 0) {
                    Swal.showValidationMessage('Selecione pelo menos um item');
                    return false;
                }

                return {
                    nome_cliente: nome,
                    email_cliente: email,
                    itens: itens
                };
            }
        });

        if (formValues) {
            await atualizarPedido(pedidoId, formValues);
        }
    } catch (error) {
        mostrarNotificacao(`Erro ao editar pedido: ${error.message}`, 'is-danger');
    }
}

// Função para atualizar o pedido na API
async function atualizarPedido(pedidoId, pedidoData) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/pedidos/${pedidoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedidoData)
        });

        if (response.ok) {
            mostrarNotificacao('Pedido atualizado com sucesso!', 'is-success');
            carregarPedidosManual();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar pedido');
        }
    } catch (error) {
        mostrarNotificacao(`Erro: ${error.message}`, 'is-danger');
    }
}