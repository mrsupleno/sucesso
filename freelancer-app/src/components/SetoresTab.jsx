import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'

function SetoresTab({ setores, setSetores }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ nome: '', descricao: '' })

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({ nome: '', descricao: '' })
  }

  const handleEdit = (setor) => {
    setEditingId(setor.id)
    setFormData({ nome: setor.nome, descricao: setor.descricao })
  }

  const handleSave = () => {
    if (!formData.nome.trim()) {
      alert('Por favor, informe o nome do setor')
      return
    }

    if (isAdding) {
      // Adicionar novo setor
      const newSetor = {
        id: Math.max(...setores.map(s => s.id), 0) + 1,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim()
      }
      setSetores([...setores, newSetor])
      setIsAdding(false)
    } else if (editingId) {
      // Editar setor existente
      setSetores(setores.map(setor =>
        setor.id === editingId
          ? { ...setor, nome: formData.nome.trim(), descricao: formData.descricao.trim() }
          : setor
      ))
      setEditingId(null)
    }

    setFormData({ nome: '', descricao: '' })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ nome: '', descricao: '' })
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este setor?')) {
      setSetores(setores.filter(setor => setor.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      {/* Botão Adicionar */}
      {!isAdding && !editingId && (
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Adicionar Setor</span>
        </button>
      )}

      {/* Formulário de Adicionar/Editar */}
      {(isAdding || editingId) && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
          <div className="bg-blue-600 text-white px-4 py-2 -mx-4 -mt-4 mb-4 rounded-t-lg">
            <h3 className="font-semibold">
              {isAdding ? 'Novo Setor' : 'Editar Setor'}
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Setor *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Salão"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Ex: Atendimento ao público"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check size={18} />
              <span>Salvar</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X size={18} />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista de Setores */}
      <div className="space-y-3">
        {setores.map((setor) => (
          <div
            key={setor.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
              <h3 className="font-semibold">{setor.nome}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(setor)}
                  className="p-1.5 hover:bg-blue-700 rounded transition-colors"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(setor.id)}
                  className="p-1.5 hover:bg-red-600 rounded transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {setor.descricao && (
              <div className="px-4 py-3">
                <p className="text-gray-600 text-sm">{setor.descricao}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {setores.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum setor cadastrado</p>
          <p className="text-sm mt-1">Clique em "Adicionar Setor" para começar</p>
        </div>
      )}
    </div>
  )
}

export default SetoresTab
