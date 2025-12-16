import { useState } from 'react'
import { X, Check, AlertCircle, Lock, Printer } from 'lucide-react'

function EncerrarDiaModal({ isOpen, onClose, programacao, setProgramacao, freelancers, setores, diasEncerrados, setDiasEncerrados }) {
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [editingFreelancerId, setEditingFreelancerId] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Formatar data YYYY-MM-DD
  const formatDateKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Formatar data para exibição
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ''
    const [ano, mes, dia] = dateStr.split('-')
    return `${dia}/${mes}/${ano}`
  }

  const dataAtual = dataSelecionada || formatDateKey(new Date())
  const daySchedule = programacao[dataAtual] || { freelancers: [] }
  const diaEncerrado = diasEncerrados?.[dataAtual] || false

  // Remover freelancer da programação
  const removeFreelancer = (freelancerId) => {
    if (confirm('Tem certeza que deseja remover este freelancer? Ele não veio trabalhar?')) {
      const newSchedule = {
        ...programacao,
        [dataAtual]: {
          freelancers: daySchedule.freelancers.filter(f => f.freelancerId !== freelancerId)
        }
      }
      setProgramacao(newSchedule)
    }
  }

  // Iniciar edição de valor
  const startEditValue = (freelancerId, currentValue) => {
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
      [dataAtual]: {
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

  // Obter dados completos do freelancer
  const getFreelancerData = (freelancerId) => {
    return freelancers.find(f => f.id === freelancerId)
  }

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Agrupar por setor
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

  const totalGeral = scheduleBySetor.reduce((sum, item) => sum + item.subtotal, 0)

  // Encerrar o dia
  const handleEncerrarDia = () => {
    if (daySchedule.freelancers.length === 0) {
      alert('Não há freelancers na programação deste dia')
      return
    }

    if (confirm(`Tem certeza que deseja ENCERRAR o dia ${formatDateDisplay(dataAtual)}?\n\nApós encerrar, não será possível fazer alterações.\nTotal a pagar: ${formatCurrency(totalGeral)}`)) {
      const novosDiasEncerrados = {
        ...diasEncerrados,
        [dataAtual]: {
          encerradoEm: new Date().toISOString(),
          totalGeral,
          freelancers: daySchedule.freelancers.length
        }
      }
      setDiasEncerrados(novosDiasEncerrados)
      alert('Dia encerrado com sucesso!\nOs dados foram bloqueados para edição.')
    }
  }

  // Reabrir dia (desbloquear)
  const handleReabrirDia = () => {
    if (confirm(`Deseja REABRIR o dia ${formatDateDisplay(dataAtual)}?\n\nIsso permitirá fazer alterações novamente.`)) {
      const novosDiasEncerrados = { ...diasEncerrados }
      delete novosDiasEncerrados[dataAtual]
      setDiasEncerrados(novosDiasEncerrados)
      alert('Dia reaberto! Agora você pode fazer alterações.')
    }
  }

  // Imprimir relatório
  const handleImprimir = () => {
    window.print()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-[448px] w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${diaEncerrado ? 'bg-gray-700' : 'bg-orange-600'} text-white px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Encerrar o Dia</h2>
            {diaEncerrado && <Lock size={18} />}
          </div>
          <button
            onClick={onClose}
            className={`p-1 ${diaEncerrado ? 'hover:bg-gray-800' : 'hover:bg-orange-700'} rounded transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Seleção de data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data do Dia
            </label>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              disabled={diaEncerrado}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            />
          </div>

          {diaEncerrado && (
            <div className="bg-gray-100 border-2 border-gray-400 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Lock size={16} />
                <span>Dia Encerrado</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Este dia foi encerrado em {new Date(diasEncerrados[dataAtual].encerradoEm).toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-gray-600">
                Não é possível fazer alterações. Se necessário, clique em "Reabrir Dia" abaixo.
              </p>
            </div>
          )}

          {!diaEncerrado && daySchedule.freelancers.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800 font-medium mb-1">
                <AlertCircle size={16} />
                <span>Confirme quem trabalhou</span>
              </div>
              <p className="text-xs text-yellow-700">
                Revise a lista abaixo e remova quem não compareceu. Ajuste valores se necessário.
              </p>
            </div>
          )}

          {/* Lista de Freelancers */}
          {scheduleBySetor.length > 0 ? (
            <div className="space-y-4">
              {scheduleBySetor.map(({ setor, schedule, subtotal }) => (
                <div key={setor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
                    <h3 className="font-semibold">{setor.nome}</h3>
                    <span className="text-sm font-medium">
                      {formatCurrency(subtotal)}
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
                                  className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                  placeholder="Valor"
                                  autoFocus
                                  disabled={diaEncerrado}
                                />
                                {!diaEncerrado && (
                                  <>
                                    <button
                                      onClick={() => saveEditedValue(item.freelancerId)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                      <Check size={18} />
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    >
                                      <X size={18} />
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="mt-1">
                                <span className="text-sm font-medium text-green-600">
                                  {formatCurrency(item.valorDiaria)}
                                </span>
                              </div>
                            )}
                          </div>

                          {!diaEncerrado && editingFreelancerId !== item.freelancerId && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => startEditValue(item.freelancerId, item.valorDiaria)}
                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Editar Valor
                              </button>
                              <button
                                onClick={() => removeFreelancer(item.freelancerId)}
                                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                Não Veio
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
              <div className="bg-orange-600 text-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Total do Dia</span>
                  <span className="text-2xl font-bold">{formatCurrency(totalGeral)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum freelancer programado para este dia</p>
              <p className="text-sm mt-1">Adicione freelancers na aba "Convocados"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          {diaEncerrado ? (
            <>
              <button
                onClick={handleImprimir}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer size={18} />
                <span>Imprimir Relatório</span>
              </button>
              <button
                onClick={handleReabrirDia}
                className="w-full px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Reabrir Dia para Edição
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </>
          ) : (
            <>
              {daySchedule.freelancers.length > 0 && (
                <button
                  onClick={handleEncerrarDia}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Check size={18} />
                  <span>Encerrar Dia e Gerar Relatório</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EncerrarDiaModal
