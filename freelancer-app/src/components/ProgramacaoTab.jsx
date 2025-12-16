import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Edit2, Check, Lock } from 'lucide-react'

function ProgramacaoTab({ setores, freelancers, programacao, setProgramacao, diasEncerrados }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingFreelancerId, setEditingFreelancerId] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Formatar data para usar como chave no objeto programacao
  const formatDateKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Formatar data para exibição
  const formatDateDisplay = (date) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()

    return `${dayName}, ${day} de ${month} de ${year}`
  }

  // Navegar para o dia anterior
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  // Navegar para o próximo dia
  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  // Ir para hoje
  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const dateKey = formatDateKey(selectedDate)
  const daySchedule = programacao[dateKey] || { freelancers: [] }
  const diaEncerrado = diasEncerrados?.[dateKey] || false

  // Adicionar freelancer à programação do dia
  const addFreelancerToDay = (freelancer) => {
    if (diaEncerrado) {
      alert('Este dia já foi encerrado. Não é possível adicionar freelancers.')
      return
    }
    const newSchedule = {
      ...programacao,
      [dateKey]: {
        freelancers: [
          ...(programacao[dateKey]?.freelancers || []),
          {
            freelancerId: freelancer.id,
            valorDiaria: freelancer.valorDiaria
          }
        ]
      }
    }
    setProgramacao(newSchedule)
  }

  // Remover freelancer da programação do dia
  const removeFreelancerFromDay = (freelancerId) => {
    if (diaEncerrado) {
      alert('Este dia já foi encerrado. Não é possível remover freelancers.')
      return
    }
    if (confirm('Tem certeza que deseja remover este freelancer da programação do dia?')) {
      const newSchedule = {
        ...programacao,
        [dateKey]: {
          freelancers: daySchedule.freelancers.filter(f => f.freelancerId !== freelancerId)
        }
      }
      setProgramacao(newSchedule)
    }
  }

  // Iniciar edição de valor
  const startEditValue = (freelancerId, currentValue) => {
    if (diaEncerrado) {
      alert('Este dia já foi encerrado. Não é possível editar valores.')
      return
    }
    setEditingFreelancerId(freelancerId)
    setEditValue(currentValue.toString())
  }

  // Salvar valor editado
  const saveEditedValue = (freelancerId) => {
    const newValue = parseFloat(editValue)
    if (isNaN(newValue) || newValue <= 0) {
      alert('Por favor, informe um valor válido')
      return
    }

    const newSchedule = {
      ...programacao,
      [dateKey]: {
        freelancers: daySchedule.freelancers.map(f =>
          f.freelancerId === freelancerId
            ? { ...f, valorDiaria: newValue }
            : f
        )
      }
    }
    setProgramacao(newSchedule)
    setEditingFreelancerId(null)
    setEditValue('')
  }

  // Cancelar edição
  const cancelEdit = () => {
    setEditingFreelancerId(null)
    setEditValue('')
  }

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Verificar se freelancer já está na programação do dia
  const isFreelancerScheduled = (freelancerId) => {
    return daySchedule.freelancers.some(f => f.freelancerId === freelancerId)
  }

  // Obter dados completos do freelancer
  const getFreelancerData = (freelancerId) => {
    return freelancers.find(f => f.id === freelancerId)
  }

  // Agrupar programação por setor
  const scheduleBySetor = setores.map(setor => {
    const setorSchedule = daySchedule.freelancers
      .map(scheduleItem => {
        const freelancer = getFreelancerData(scheduleItem.freelancerId)
        return freelancer && freelancer.setorId === setor.id
          ? { ...scheduleItem, freelancer }
          : null
      })
      .filter(item => item !== null)

    return {
      setor,
      schedule: setorSchedule,
      subtotal: setorSchedule.reduce((sum, item) => sum + item.valorDiaria, 0)
    }
  }).filter(item => item.schedule.length > 0)

  // Calcular total geral
  const totalGeral = scheduleBySetor.reduce((sum, item) => sum + item.subtotal, 0)

  // Freelancers disponíveis para adicionar (agrupados por setor)
  const availableFreelancersBySetor = setores.map(setor => ({
    setor,
    freelancers: freelancers.filter(
      f => f.setorId === setor.id && !isFreelancerScheduled(f.id)
    )
  })).filter(item => item.freelancers.length > 0)

  return (
    <div className="space-y-4">
      {/* Navegação de Data */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={goToPreviousDay}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Dia anterior"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex-1 text-center">
            <div className="text-sm font-semibold text-gray-900">
              {formatDateDisplay(selectedDate)}
            </div>
            <button
              onClick={goToToday}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              Ir para hoje
            </button>
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Próximo dia"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Aviso de Dia Encerrado */}
      {diaEncerrado && (
        <div className="bg-gray-100 border-2 border-gray-400 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Lock size={18} />
            <span>Dia Encerrado - Somente Visualização</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Este dia foi encerrado e não pode ser editado. Use "Encerrar Dia" para reabrir se necessário.
          </p>
        </div>
      )}

      {/* Programação do Dia */}
      {scheduleBySetor.length > 0 ? (
        <div className="space-y-4">
          {scheduleBySetor.map(({ setor, schedule, subtotal }) => (
            <div key={setor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
                <h3 className="font-semibold">{setor.nome}</h3>
                <span className="text-sm font-medium">
                  Subtotal: {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="divide-y divide-gray-200">
                {schedule.map((item) => (
                  <div
                    key={item.freelancerId}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.freelancer.nome}
                        </h4>

                        {editingFreelancerId === item.freelancerId ? (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Valor"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEditedValue(item.freelancerId)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Salvar"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Cancelar"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(item.valorDiaria)}
                            </span>
                            {item.valorDiaria !== item.freelancer.valorDiaria && (
                              <span className="text-xs text-gray-500">
                                (padrão: {formatCurrency(item.freelancer.valorDiaria)})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {editingFreelancerId !== item.freelancerId && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => startEditValue(item.freelancerId, item.valorDiaria)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar valor"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => removeFreelancerFromDay(item.freelancerId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remover"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Total Geral */}
          <div className="bg-blue-600 text-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Total Geral</span>
              <span className="text-2xl font-bold">{formatCurrency(totalGeral)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
          <p>Nenhum freelancer programado para este dia</p>
          <p className="text-sm mt-1">Adicione freelancers usando os botões abaixo</p>
        </div>
      )}

      {/* Adicionar Freelancers */}
      {availableFreelancersBySetor.length > 0 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Adicionar Freelancers
            </h3>
          </div>

          {availableFreelancersBySetor.map(({ setor, freelancers: availableFreelancers }) => (
            <div key={setor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-2">
                <h3 className="font-semibold">{setor.nome}</h3>
              </div>

              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {availableFreelancers.map((freelancer) => (
                    <button
                      key={freelancer.id}
                      onClick={() => addFreelancerToDay(freelancer)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>{freelancer.nome}</span>
                      <span className="text-xs opacity-90">
                        ({formatCurrency(freelancer.valorDiaria)})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {availableFreelancersBySetor.length === 0 && scheduleBySetor.length > 0 && (
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm">Todos os freelancers já foram adicionados à programação</p>
        </div>
      )}
    </div>
  )
}

export default ProgramacaoTab
