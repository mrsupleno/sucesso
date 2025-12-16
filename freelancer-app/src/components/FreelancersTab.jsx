import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Check, Phone, FileText, DollarSign } from 'lucide-react'

function FreelancersTab({ freelancers, setFreelancers, setores }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cpf: '',
    valorDiaria: '',
    setorId: ''
  })

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({
      nome: '',
      telefone: '',
      cpf: '',
      valorDiaria: '',
      setorId: setores.length > 0 ? setores[0].id : ''
    })
  }

  const handleEdit = (freelancer) => {
    setEditingId(freelancer.id)
    setFormData({
      nome: freelancer.nome,
      telefone: freelancer.telefone || '',
      cpf: freelancer.cpf || '',
      valorDiaria: freelancer.valorDiaria.toString(),
      setorId: freelancer.setorId
    })
  }

  const handleSave = () => {
    if (!formData.nome.trim()) {
      alert('Por favor, informe o nome do freelancer')
      return
    }

    if (!formData.valorDiaria || parseFloat(formData.valorDiaria) <= 0) {
      alert('Por favor, informe um valor de diária válido')
      return
    }

    if (!formData.setorId) {
      alert('Por favor, selecione um setor')
      return
    }

    const freelancerData = {
      nome: formData.nome.trim(),
      telefone: formData.telefone.trim(),
      cpf: formData.cpf.trim(),
      valorDiaria: parseFloat(formData.valorDiaria),
      setorId: parseInt(formData.setorId)
    }

    if (isAdding) {
      // Adicionar novo freelancer
      const newFreelancer = {
        id: Math.max(...freelancers.map(f => f.id), 0) + 1,
        ...freelancerData
      }
      setFreelancers([...freelancers, newFreelancer])
      setIsAdding(false)
    } else if (editingId) {
      // Editar freelancer existente
      setFreelancers(freelancers.map(freelancer =>
        freelancer.id === editingId
          ? { ...freelancer, ...freelancerData }
          : freelancer
      ))
      setEditingId(null)
    }

    setFormData({
      nome: '',
      telefone: '',
      cpf: '',
      valorDiaria: '',
      setorId: ''
    })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      nome: '',
      telefone: '',
      cpf: '',
      valorDiaria: '',
      setorId: ''
    })
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este freelancer?')) {
      setFreelancers(freelancers.filter(freelancer => freelancer.id !== id))
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPhone = (phone) => {
    if (!phone) return null
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const formatCPF = (cpf) => {
    if (!cpf) return null
    const cleaned = cpf.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
    }
    return cpf
  }

  // Agrupar freelancers por setor
  const freelancersBySetor = setores.map(setor => ({
    setor,
    freelancers: freelancers.filter(f => f.setorId === setor.id)
  }))

  return (
    <div className="space-y-4">
      {/* Botão Adicionar */}
      {!isAdding && !editingId && (
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Adicionar Freelancer</span>
        </button>
      )}

      {/* Formulário de Adicionar/Editar */}
      {(isAdding || editingId) && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
          <div className="bg-blue-600 text-white px-4 py-2 -mx-4 -mt-4 mb-4 rounded-t-lg">
            <h3 className="font-semibold">
              {isAdding ? 'Novo Freelancer' : 'Editar Freelancer'}
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome completo"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setor *
            </label>
            <select
              value={formData.setorId}
              onChange={(e) => setFormData({ ...formData, setorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um setor</option>
              {setores.map(setor => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Diária (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.valorDiaria}
              onChange={(e) => setFormData({ ...formData, valorDiaria: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone (opcional)
            </label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF (opcional)
            </label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000.000.000-00"
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

      {/* Lista de Freelancers por Setor */}
      <div className="space-y-4">
        {freelancersBySetor.map(({ setor, freelancers: setorFreelancers }) => (
          <div key={setor.id}>
            {setorFreelancers.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-2">
                  <h3 className="font-semibold">{setor.nome}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {setorFreelancers.map((freelancer) => (
                    <div
                      key={freelancer.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {freelancer.nome}
                          </h4>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign size={14} className="text-green-600" />
                              <span className="font-medium text-green-600">
                                {formatCurrency(freelancer.valorDiaria)}/dia
                              </span>
                            </div>
                            {freelancer.telefone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={14} />
                                <span>{formatPhone(freelancer.telefone)}</span>
                              </div>
                            )}
                            {freelancer.cpf && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FileText size={14} />
                                <span>{formatCPF(freelancer.cpf)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(freelancer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(freelancer.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {freelancers.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum freelancer cadastrado</p>
          <p className="text-sm mt-1">Clique em "Adicionar Freelancer" para começar</p>
        </div>
      )}
    </div>
  )
}

export default FreelancersTab
