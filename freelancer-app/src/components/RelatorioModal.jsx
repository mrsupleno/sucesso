import { useState, useMemo } from 'react'
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

function RelatorioModal({ isOpen, onClose, programacao, freelancers, setores }) {
  const [tipoRelatorio, setTipoRelatorio] = useState('diario') // diario, semanal, mensal, periodo
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [mesAno, setMesAno] = useState('')
  const [semanaInicio, setSemanaInicio] = useState('')

  // Função para formatar data YYYY-MM-DD
  const formatDateKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Função para obter todas as datas do período
  const getDatasRelatorio = useMemo(() => {
    const hoje = new Date()
    const datas = []

    if (tipoRelatorio === 'diario') {
      const data = dataInicio || formatDateKey(hoje)
      datas.push(data)
    } else if (tipoRelatorio === 'semanal') {
      const inicio = semanaInicio ? new Date(semanaInicio) : new Date()
      inicio.setHours(0, 0, 0, 0)

      // Ajustar para começar na segunda-feira
      const diaSemana = inicio.getDay()
      const diffParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana
      inicio.setDate(inicio.getDate() + diffParaSegunda)

      for (let i = 0; i < 7; i++) {
        const data = new Date(inicio)
        data.setDate(data.getDate() + i)
        datas.push(formatDateKey(data))
      }
    } else if (tipoRelatorio === 'mensal') {
      const mesAnoSelecionado = mesAno || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
      const [ano, mes] = mesAnoSelecionado.split('-')
      const primeiroDia = new Date(ano, mes - 1, 1)
      const ultimoDia = new Date(ano, mes, 0)

      for (let dia = primeiroDia; dia <= ultimoDia; dia.setDate(dia.getDate() + 1)) {
        datas.push(formatDateKey(new Date(dia)))
      }
    } else if (tipoRelatorio === 'periodo') {
      if (dataInicio && dataFim) {
        const inicio = new Date(dataInicio)
        const fim = new Date(dataFim)

        for (let dia = new Date(inicio); dia <= fim; dia.setDate(dia.getDate() + 1)) {
          datas.push(formatDateKey(new Date(dia)))
        }
      }
    }

    return datas
  }, [tipoRelatorio, dataInicio, dataFim, mesAno, semanaInicio])

  // Calcular dados do relatório
  const dadosRelatorio = useMemo(() => {
    const totaisPorFreelancer = {}
    const totaisPorSetor = {}
    let totalGeral = 0
    let diasTrabalhados = 0

    getDatasRelatorio.forEach(data => {
      if (programacao[data]?.freelancers) {
        diasTrabalhados++
        programacao[data].freelancers.forEach(item => {
          const freelancer = freelancers.find(f => f.id === item.freelancerId)
          if (freelancer) {
            const setor = setores.find(s => s.id === freelancer.setorId)

            // Total por freelancer
            if (!totaisPorFreelancer[freelancer.id]) {
              totaisPorFreelancer[freelancer.id] = {
                nome: freelancer.nome,
                setor: setor?.nome || 'Sem setor',
                dias: 0,
                total: 0
              }
            }
            totaisPorFreelancer[freelancer.id].dias++
            totaisPorFreelancer[freelancer.id].total += item.valorDiaria

            // Total por setor
            if (setor) {
              if (!totaisPorSetor[setor.id]) {
                totaisPorSetor[setor.id] = {
                  nome: setor.nome,
                  total: 0
                }
              }
              totaisPorSetor[setor.id].total += item.valorDiaria
            }

            totalGeral += item.valorDiaria
          }
        })
      }
    })

    return {
      totaisPorFreelancer: Object.values(totaisPorFreelancer).sort((a, b) => b.total - a.total),
      totaisPorSetor: Object.values(totaisPorSetor),
      totalGeral,
      diasTrabalhados,
      totalDias: getDatasRelatorio.length
    }
  }, [getDatasRelatorio, programacao, freelancers, setores])

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Formatar data para exibição
  const formatDateDisplay = (dateStr) => {
    const [ano, mes, dia] = dateStr.split('-')
    return `${dia}/${mes}/${ano}`
  }

  // Obter título do período
  const getTituloPeriodo = () => {
    if (tipoRelatorio === 'diario') {
      return dataInicio ? `Dia ${formatDateDisplay(dataInicio)}` : 'Dia Atual'
    } else if (tipoRelatorio === 'semanal') {
      if (getDatasRelatorio.length > 0) {
        const primeira = getDatasRelatorio[0]
        const ultima = getDatasRelatorio[getDatasRelatorio.length - 1]
        return `Semana de ${formatDateDisplay(primeira)} a ${formatDateDisplay(ultima)}`
      }
      return 'Semana Atual'
    } else if (tipoRelatorio === 'mensal') {
      if (mesAno) {
        const [ano, mes] = mesAno.split('-')
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        return `${meses[parseInt(mes) - 1]} de ${ano}`
      }
      return 'Mês Atual'
    } else if (tipoRelatorio === 'periodo') {
      if (dataInicio && dataFim) {
        return `${formatDateDisplay(dataInicio)} a ${formatDateDisplay(dataFim)}`
      }
      return 'Período Personalizado'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-[448px] w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Relatório</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Seleção de tipo de relatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="diario">Diário</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
              <option value="periodo">Período Personalizado</option>
            </select>
          </div>

          {/* Filtros de data */}
          {tipoRelatorio === 'diario' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {tipoRelatorio === 'semanal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Início da Semana (Segunda-feira)
              </label>
              <input
                type="date"
                value={semanaInicio}
                onChange={(e) => setSemanaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {tipoRelatorio === 'mensal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês/Ano
              </label>
              <input
                type="month"
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {tipoRelatorio === 'periodo' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Resumo do Período */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="font-semibold text-blue-900 mb-2">{getTituloPeriodo()}</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>Total de dias no período: {dadosRelatorio.totalDias}</p>
              <p>Dias com programação: {dadosRelatorio.diasTrabalhados}</p>
            </div>
          </div>

          {/* Total Geral */}
          <div className="bg-blue-600 text-white rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-1">Total Geral</p>
              <p className="text-3xl font-bold">{formatCurrency(dadosRelatorio.totalGeral)}</p>
            </div>
          </div>

          {/* Totais por Setor */}
          {dadosRelatorio.totaisPorSetor.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Por Setor</h3>
              <div className="space-y-2">
                {dadosRelatorio.totaisPorSetor.map((setor, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">{setor.nome}</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(setor.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totais por Freelancer */}
          {dadosRelatorio.totaisPorFreelancer.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Por Freelancer</h3>
              <div className="space-y-2">
                {dadosRelatorio.totaisPorFreelancer.map((freelancer, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{freelancer.nome}</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(freelancer.total)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span>{freelancer.setor}</span>
                      <span className="mx-2">•</span>
                      <span>{freelancer.dias} {freelancer.dias === 1 ? 'dia' : 'dias'}</span>
                      <span className="mx-2">•</span>
                      <span>Média: {formatCurrency(freelancer.total / freelancer.dias)}/dia</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dadosRelatorio.totaisPorFreelancer.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma programação encontrada para o período selecionado</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default RelatorioModal
