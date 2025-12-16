import { useState } from 'react'
import { X, Shield, Check, AlertCircle } from 'lucide-react'

function PerfilAcessoModal({ isOpen, onClose, perfilAtual, onSave }) {
  const [perfilSelecionado, setPerfilSelecionado] = useState(perfilAtual || 'Gerente')

  const perfis = [
    {
      nome: 'Administrador',
      descricao: 'Acesso completo ao sistema',
      permissoes: [
        'Gerenciar todos os módulos',
        'Adicionar e remover usuários',
        'Configurar empresa e personalização',
        'Acessar relatórios completos',
        'Gerenciar freelancers e setores',
        'Controlar programação e pagamentos',
        'Encerrar dias e gerar relatórios'
      ],
      cor: 'red'
    },
    {
      nome: 'Gerente',
      descricao: 'Gerenciar operações diárias',
      permissoes: [
        'Gerenciar freelancers e setores',
        'Criar e editar programação',
        'Encerrar dias',
        'Visualizar relatórios',
        'Gerenciar pagamentos (com restrições)',
        'Editar dados da empresa'
      ],
      cor: 'blue'
    },
    {
      nome: 'Financeiro',
      descricao: 'Controle de pagamentos e relatórios',
      permissoes: [
        'Visualizar programação',
        'Registrar e gerenciar pagamentos',
        'Acessar todos os relatórios',
        'Exportar dados financeiros',
        'Visualizar dados da empresa',
        'Imprimir recibos'
      ],
      cor: 'green'
    }
  ]

  const getCorClasse = (cor) => {
    const cores = {
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        icon: 'text-red-600',
        selected: 'border-red-500 bg-red-100'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        icon: 'text-blue-600',
        selected: 'border-blue-500 bg-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        icon: 'text-green-600',
        selected: 'border-green-500 bg-green-100'
      }
    }
    return cores[cor]
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(perfilSelecionado)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Shield size={20} />
            Perfil de Acesso
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Aviso */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Importante</p>
              <p className="text-sm text-yellow-700 mt-1">
                O perfil de acesso define as permissões do usuário no sistema. Alterações podem afetar o que o usuário pode visualizar e fazer.
              </p>
            </div>
          </div>

          {/* Perfil Atual */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Perfil Atual
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-semibold text-blue-900">{perfilAtual}</p>
            </div>
          </div>

          {/* Seleção de Perfis */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o Novo Perfil
            </label>

            {perfis.map((perfil) => {
              const cores = getCorClasse(perfil.cor)
              const isSelected = perfilSelecionado === perfil.nome

              return (
                <div
                  key={perfil.nome}
                  onClick={() => setPerfilSelecionado(perfil.nome)}
                  className={`
                    ${cores.bg} ${isSelected ? cores.selected : cores.border}
                    border-2 rounded-lg p-4 cursor-pointer transition-all
                    hover:shadow-md
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield size={20} className={cores.icon} />
                      <h3 className={`font-bold ${cores.text}`}>{perfil.nome}</h3>
                    </div>
                    {isSelected && (
                      <div className={`${cores.icon} bg-white rounded-full p-1`}>
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{perfil.descricao}</p>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Permissões:</p>
                    <ul className="space-y-1">
                      {perfil.permissoes.map((permissao, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check size={14} className={`${cores.icon} flex-shrink-0 mt-0.5`} />
                          <span>{permissao}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PerfilAcessoModal
