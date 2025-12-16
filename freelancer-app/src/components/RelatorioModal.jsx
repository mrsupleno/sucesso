import { useState, useMemo } from 'react'
import { X, Calendar, ChevronLeft, ChevronRight, Printer } from 'lucide-react'

function RelatorioModal({ isOpen, onClose, programacao, freelancers, setores, pagamentos }) {
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
    let totalDevido = 0
    let totalPago = 0
    let diasTrabalhados = 0

    // Calcular valores devidos
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
                id: freelancer.id,
                nome: freelancer.nome,
                setor: setor?.nome || 'Sem setor',
                dias: 0,
                totalDevido: 0,
                totalPago: 0
              }
            }
            totaisPorFreelancer[freelancer.id].dias++
            totaisPorFreelancer[freelancer.id].totalDevido += item.valorDiaria

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

            totalDevido += item.valorDiaria
          }
        })
      }
    })

    // Calcular valores já pagos no período
    if (pagamentos) {
      Object.keys(pagamentos).forEach(freelancerId => {
        const id = parseInt(freelancerId)
        if (totaisPorFreelancer[id]) {
          const pagamentosFreelancer = pagamentos[freelancerId] || []
          pagamentosFreelancer.forEach(pag => {
            const dataPagamento = pag.data
            // Verifica se o pagamento está no período (compara ano-mês)
            if (getDatasRelatorio.some(d => dataPagamento.startsWith(d.substring(0, 7)))) {
              totaisPorFreelancer[id].totalPago += pag.valor
              totalPago += pag.valor
            }
          })
        }
      })
    }

    // Calcular saldo e status para cada freelancer
    const freelancersComSaldo = Object.values(totaisPorFreelancer).map(f => ({
      ...f,
      saldo: f.totalDevido - f.totalPago,
      status: f.totalPago === 0 ? 'pendente' :
              f.totalPago >= f.totalDevido ? 'pago' : 'parcial'
    })).sort((a, b) => b.saldo - a.saldo)

    return {
      totaisPorFreelancer: freelancersComSaldo,
      totaisPorSetor: Object.values(totaisPorSetor),
      totalDevido,
      totalPago,
      totalPendente: totalDevido - totalPago,
      diasTrabalhados,
      totalDias: getDatasRelatorio.length
    }
  }, [getDatasRelatorio, programacao, freelancers, setores, pagamentos])

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

  // Imprimir relatório completo
  const handleImprimir = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    const dataAtual = new Date().toLocaleDateString('pt-BR')

    const freelancersHTML = dadosRelatorio.totaisPorFreelancer.map(f => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left;">${f.nome}</td>
        <td style="padding: 12px; text-align: center;">${f.setor}</td>
        <td style="padding: 12px; text-align: center;">${f.dias}</td>
        <td style="padding: 12px; text-align: right;">${formatCurrency(f.totalDevido)}</td>
        <td style="padding: 12px; text-align: right; color: green;">${formatCurrency(f.totalPago)}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; color: ${f.saldo > 0 ? 'red' : 'gray'};">${formatCurrency(f.saldo)}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório Financeiro - ${getTituloPeriodo()}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 1000px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .resumo {
              display: flex;
              justify-content: space-around;
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
            }
            .resumo-item {
              text-align: center;
            }
            .resumo-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            .resumo-valor {
              font-size: 20px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #1f2937;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            .totais {
              margin-top: 20px;
              padding: 15px;
              background-color: #f3f4f6;
              border: 2px solid #1f2937;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RELATÓRIO FINANCEIRO</h1>
            <h2>${getTituloPeriodo()}</h2>
            <p>Gerado em: ${dataAtual}</p>
          </div>

          <div class="resumo">
            <div class="resumo-item">
              <div class="resumo-label">Total de Dias</div>
              <div class="resumo-valor">${dadosRelatorio.totalDias}</div>
            </div>
            <div class="resumo-item">
              <div class="resumo-label">Dias com Programação</div>
              <div class="resumo-valor">${dadosRelatorio.diasTrabalhados}</div>
            </div>
            <div class="resumo-item">
              <div class="resumo-label">Total de Freelancers</div>
              <div class="resumo-valor">${dadosRelatorio.totaisPorFreelancer.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th style="text-align: center;">Setor</th>
                <th style="text-align: center;">Dias</th>
                <th style="text-align: right;">Total Devido</th>
                <th style="text-align: right;">Pago</th>
                <th style="text-align: right;">Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${freelancersHTML}
            </tbody>
          </table>

          <div class="totais">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>TOTAL DEVIDO:</strong>
              <span style="font-size: 18px;">${formatCurrency(dadosRelatorio.totalDevido)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <strong>TOTAL PAGO:</strong>
              <span style="font-size: 18px; color: green;">${formatCurrency(dadosRelatorio.totalPago)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #1f2937;">
              <strong style="font-size: 20px;">SALDO PENDENTE:</strong>
              <span style="font-size: 22px; font-weight: bold; color: ${dadosRelatorio.totalPendente > 0 ? 'red' : 'gray'};">${formatCurrency(dadosRelatorio.totalPendente)}</span>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>Este relatório foi gerado pelo Sistema de Controle de Freelancers</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
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

          {/* Totais */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-700 mb-1">Total Devido</p>
              <p className="text-sm font-bold text-blue-900">{formatCurrency(dadosRelatorio.totalDevido)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-xs text-green-700 mb-1">Total Pago</p>
              <p className="text-sm font-bold text-green-900">{formatCurrency(dadosRelatorio.totalPago)}</p>
            </div>
            <div className={`${dadosRelatorio.totalPendente > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3 text-center`}>
              <p className={`text-xs ${dadosRelatorio.totalPendente > 0 ? 'text-red-700' : 'text-gray-700'} mb-1`}>Pendente</p>
              <p className={`text-sm font-bold ${dadosRelatorio.totalPendente > 0 ? 'text-red-900' : 'text-gray-900'}`}>{formatCurrency(dadosRelatorio.totalPendente)}</p>
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
                    className={`border rounded-lg p-3 ${
                      freelancer.status === 'pago' ? 'bg-green-50 border-green-200' :
                      freelancer.status === 'parcial' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{freelancer.nome}</h4>
                        <p className="text-xs text-gray-600">{freelancer.setor} • {freelancer.dias} dia(s)</p>
                      </div>
                      {freelancer.status === 'pago' && (
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                          ✓ Pago
                        </span>
                      )}
                      {freelancer.status === 'parcial' && (
                        <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                          ⚠ Parcial
                        </span>
                      )}
                      {freelancer.status === 'pendente' && (
                        <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                          ✕ Pendente
                        </span>
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total devido:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(freelancer.totalDevido)}</span>
                      </div>
                      {freelancer.totalPago > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Já pago:</span>
                          <span className="font-medium text-green-600">{formatCurrency(freelancer.totalPago)}</span>
                        </div>
                      )}
                      {freelancer.saldo !== 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saldo:</span>
                          <span className={`font-semibold ${freelancer.saldo > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {formatCurrency(Math.abs(freelancer.saldo))}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span className="text-xs text-gray-500">Média/dia:</span>
                        <span className="text-xs text-gray-700">{formatCurrency(freelancer.totalDevido / freelancer.dias)}</span>
                      </div>
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
        <div className="border-t border-gray-200 p-4 space-y-2">
          {dadosRelatorio.totaisPorFreelancer.length > 0 && (
            <button
              onClick={handleImprimir}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer size={18} />
              <span>Imprimir Relatório Completo</span>
            </button>
          )}
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
