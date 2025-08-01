let ItemsdataTable;
let itemToDelete = null;

$(document).ready(function() {
    // Inicializa a tabela
    ItemsdataTable = $('#tabelaItems').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json'
        },
        responsive: {
            details: {
                display: $.fn.dataTable.Responsive.display.modal({
                    header: function(row) {
                        var data = row.data();
                        return 'Detalhes: ' + data[1];
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
                data: 'nome_item',
                className: 'has-text-weight-semibold'
            },
            { 
                data: 'categoria_item'
            },
            { 
                data: 'preco_unitario',
                render: function(data, type, row) {
                    if (type === 'display') {
                        return 'R$ ' + parseFloat(data).toFixed(2).replace('.', ',');
                    }
                    return data;
                },
                className: 'has-text-right preco-cell'
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
                                    hx-get="/items/editar/${row.id}" 
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
                        </div>
                    `;
                }
            }
        ]
    });

    // Carrega os itens
    carregarItensManual();

    // Configura o modal de confirmação de exclusão
    const confirmModal = $('#confirmModal');
    $(document).on('click', '.btn-excluir', function() {
        itemToDelete = $(this).data('id');
        confirmModal.addClass('is-active');
    });

    $(document).on('click', '.btn-editar', async function() {
        const itemId = $(this).data('id');
        await mostrarModalEditarItem(itemId);
    });

    $('#confirmDelete').on('click', function() {
        if (itemToDelete) {
            excluirItem(itemToDelete);
        }
        confirmModal.removeClass('is-active');
    });

    $('#cancelDelete, .modal-background, .modal-card-head .delete').on('click', function() {
        confirmModal.removeClass('is-active');
        itemToDelete = null;
    });

    // Novo item com SweetAlert2
    $('#btnNovoItem').on('click', function() {
        Swal.fire({
            title: 'Adicionar Novo Item',
            html:
                '<input id="nome_item" class="swal2-input" placeholder="Nome do Item" required>' +
                '<input id="categoria_item" class="swal2-input" placeholder="Categoria" required>' +
                '<input id="preco_unitario" class="swal2-input" placeholder="Preço Unitário" type="number" step="0.01" required>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    nome_item: document.getElementById('nome_item').value,
                    categoria_item: document.getElementById('categoria_item').value,
                    preco_unitario: document.getElementById('preco_unitario').value
                }
            },
            validationMessage: 'Por favor, preencha todos os campos',
            backdrop: 'rgba(0,0,0,0.4)'
        }).then((result) => {
            if (result.isConfirmed) {
                criarItem(result.value);
            }
        });
    });
});

async function criarItem(itemData) {
    try {
        const response = await fetch('http://127.0.0.1:8000/items/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData)
        });

        if (response.ok) {
            const newItem = await response.json();
            mostrarNotificacao('Item criado com sucesso!', 'is-success');
            carregarItensManual();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao criar item');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao criar item: ' + error.message, 'is-danger');
    }
}

async function carregarItensManual() {
    try {
        const response = await fetch('http://127.0.0.1:8000/items/');
        const items = await response.json();
        
        ItemsdataTable.clear();
        ItemsdataTable.rows.add(items).draw();
        
    } catch (error) {
        mostrarNotificacao('Erro ao carregar itens: ' + error.message, 'is-danger');
    }
}

async function excluirItem(id) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/items/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            mostrarNotificacao('Item excluído com sucesso!', 'is-success');
            carregarItensManual();
        } else {
            throw new Error('Falha ao excluir item');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao excluir item: ' + error.message, 'is-danger');
    }
}
function mostrarNotificacao(mensagem, tipo) {
    // Configurações baseadas no tipo
    const config = {
        'is-success': {
            icon: 'success',
            title: 'Sucesso',
            iconColor: '#48c774',
            background: '#effaf3',
            color: '#257942',
            timer: 3000
        },
        'is-danger': {
            icon: 'error',
            title: 'Erro',
            iconColor: '#f14668',
            background: '#feecf0',
            color: '#cc0f35',
            timer: 4000
        },
        'is-warning': {
            icon: 'warning',
            title: 'Atenção',
            iconColor: '#ffdd57',
            background: '#fffbeb',
            color: '#946c00',
            timer: 3500
        },
        'is-info': {
            icon: 'info',
            title: 'Informação',
            iconColor: '#3e8ed0',
            background: '#eff5fb',
            color: '#296fa8',
            timer: 3000
        }
    };

    // Configuração padrão se o tipo não for reconhecido
    const settings = config[tipo] || {
        icon: 'info',
        title: 'Notificação',
        iconColor: '#3e8ed0',
        background: '#f5f5f5',
        color: '#363636',
        timer: 3000
    };

    // Exibe a notificação
    Swal.fire({
        icon: settings.icon,
        iconColor: settings.iconColor,
        title: settings.title,
        text: mensagem,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: settings.timer,
        timerProgressBar: true,
        background: settings.background,
        color: settings.color,
        width: '400px',
        customClass: {
            container: 'notification-container',
            popup: 'notification-popup',
            title: 'notification-title',
            htmlContainer: 'notification-content'
        },
        showClass: {
            popup: 'animate__animated animate__fadeInRight'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutRight'
        }
    });
}

// Função para mostrar o modal de edição
async function mostrarModalEditarItem(itemId) {
    try {
        // Carrega os dados do item
        const response = await fetch(`http://127.0.0.1:8000/items/${itemId}`);
        if (!response.ok) throw new Error('Item não encontrado');
        const item = await response.json();

        // Modal de edição
        const { value: formValues } = await Swal.fire({
            title: 'Editar Item',
            html:
                `<input id="nome_item" class="swal2-input" placeholder="Nome do Item" value="${item.nome_item}" required>
                 <input id="categoria_item" class="swal2-input" placeholder="Categoria" value="${item.categoria_item}" required>
                 <input id="preco_unitario" class="swal2-input" placeholder="Preço Unitário" type="number" step="0.01" value="${item.preco_unitario}" required>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Salvar Alterações',
            cancelButtonText: 'Cancelar',
            backdrop: 'rgba(0,0,0,0.4)',
            preConfirm: () => {
                return {
                    nome_item: document.getElementById('nome_item').value,
                    categoria_item: document.getElementById('categoria_item').value,
                    preco_unitario: parseFloat(document.getElementById('preco_unitario').value)
                };
            },
            validationMessage: 'Por favor, preencha todos os campos corretamente'
        });

        if (formValues) {
            await atualizarItem(itemId, formValues);
        }
    } catch (error) {
        mostrarNotificacao('Erro ao carregar item para edição: ' + error.message, 'is-danger');
    }
}

async function atualizarItem(itemId, itemData) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData)
        });

        if (response.ok) {
            mostrarNotificacao('Item atualizado com sucesso!', 'is-success');
            carregarItensManual();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao atualizar item');
        }
    } catch (error) {
        mostrarNotificacao('Erro ao atualizar item: ' + error.message, 'is-danger');
    }
}

// Adiciona os estilos necessários
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @import 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
    
    .notification-container {
        padding: 10px;
    }
    
    .notification-popup {
        border-radius: 6px;
        box-shadow: 0 2px 15px rgba(0,0,0,0.1);
        border-left: 4px solid ${config[tipo]?.iconColor || '#3e8ed0'};
    }
    
    .notification-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 5px;
    }
    
    .notification-content {
        font-size: 0.95rem;
        line-height: 1.4;
    }
    
    .swal2-progress-bar {
        background: ${config[tipo]?.iconColor || '#3e8ed0'} !important;
    }
`;
document.head.appendChild(notificationStyles);