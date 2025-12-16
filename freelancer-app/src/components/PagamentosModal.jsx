import { useState, useMemo } from 'react'
import { X, Check, DollarSign, Calendar, AlertCircle, Printer } from 'lucide-react'

function PagamentosModal({ isOpen, onClose, programacao, freelancers, setores, pagamentos, setPagamentos }) {
  const [tipoRelatorio, setTipoRelatorio] = useState('mensal')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [mesAno, setMesAno] = useState('')
  const [semanaInicio, setSemanaInicio] = useState('')
  const [registrandoPagamento, setRegistrandoPagamento] = useState(null)
  const [valorPagamento, setValorPagamento] = useState('')

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

  // Calcular valores devidos e pagos por freelancer
  const dadosPagamentos = useMemo(() => {
    const freelancerData = {}

    // Calcular valores devidos
    getDatasRelatorio.forEach(data => {
      if (programacao[data]?.freelancers) {
        programacao[data].freelancers.forEach(item => {
          const freelancer = freelancers.find(f => f.id === item.freelancerId)
          if (freelancer) {
            if (!freelancerData[freelancer.id]) {
              freelancerData[freelancer.id] = {
                id: freelancer.id,
                nome: freelancer.nome,
                setor: setores.find(s => s.id === freelancer.setorId)?.nome || 'Sem setor',
                dias: 0,
                totalDevido: 0,
                totalPago: 0
              }
            }
            freelancerData[freelancer.id].dias++
            freelancerData[freelancer.id].totalDevido += item.valorDiaria
          }
        })
      }
    })

    // Calcular valores já pagos no período
    if (pagamentos) {
      Object.keys(pagamentos).forEach(freelancerId => {
        const id = parseInt(freelancerId)
        if (freelancerData[id]) {
          const pagamentosFreelancer = pagamentos[freelancerId] || []
          pagamentosFreelancer.forEach(pag => {
            const dataPagamento = pag.data
            if (getDatasRelatorio.some(d => dataPagamento.startsWith(d.substring(0, 7)))) {
              freelancerData[id].totalPago += pag.valor
            }
          })
        }
      })
    }

    return Object.values(freelancerData).map(f => ({
      ...f,
      saldo: f.totalDevido - f.totalPago,
      status: f.totalPago === 0 ? 'pendente' :
              f.totalPago >= f.totalDevido ? 'pago' : 'parcial'
    })).sort((a, b) => b.saldo - a.saldo)
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

  // Registrar pagamento
  const handleRegistrarPagamento = (freelancerId) => {
    const valor = parseFloat(valorPagamento)
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, informe um valor válido')
      return
    }

    const freelancerData = dadosPagamentos.find(f => f.id === freelancerId)
    if (valor > freelancerData.saldo) {
      if (!confirm(`O valor informado (${formatCurrency(valor)}) é maior que o saldo devedor (${formatCurrency(freelancerData.saldo)}). Deseja continuar?`)) {
        return
      }
    }

    const novoPagamento = {
      data: new Date().toISOString(),
      valor: valor,
      periodo: getTituloPeriodo()
    }

    const novosPagamentos = {
      ...pagamentos,
      [freelancerId]: [...(pagamentos?.[freelancerId] || []), novoPagamento]
    }

    setPagamentos(novosPagamentos)

    // Gerar recibo automaticamente
    imprimirReciboIndividual(freelancerData, valor)

    setRegistrandoPagamento(null)
    setValorPagamento('')
  }

  // Imprimir recibo individual
  const imprimirReciboIndividual = (freelancer, valorPago) => {
    const printWindow = window.open('', '', 'width=800,height=600')
    const dataAtual = new Date().toLocaleDateString('pt-BR')

    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo de Pagamento - ${freelancer.nome}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .recibo {
              border: 2px solid #000;
              padding: 30px;
              margin-bottom: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .linha {
              margin-bottom: 15px;
              line-height: 1.8;
            }
            .valor-destaque {
              font-size: 24px;
              font-weight: bold;
              color: green;
            }
            .assinatura {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 2px solid #000;
            }
            .campo-assinatura {
              border-bottom: 1px solid #000;
              width: 100%;
              height: 50px;
              margin-top: 10px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="recibo">
            <div class="header">
              <h1>RECIBO DE PAGAMENTO</h1>
              <p>Nº _______ - Data: ${dataAtual}</p>
            </div>

            <div class="linha">
              <strong>Recebi de:</strong> __________________________________________
            </div>

            <div class="linha">
              <strong>Nome do Freelancer:</strong> ${freelancer.nome}
            </div>

            <div class="linha">
              <strong>Setor:</strong> ${freelancer.setor}
            </div>

            <div class="linha">
              <strong>Período:</strong> ${getTituloPeriodo()}
            </div>

            <div class="linha">
              <strong>Dias Trabalhados:</strong> ${freelancer.dias} dia(s)
            </div>

            <div class="linha" style="margin-top: 30px; padding: 20px; background-color: #f0f0f0;">
              <strong style="font-size: 18px;">VALOR RECEBIDO:</strong><br>
              <span class="valor-destaque">${formatCurrency(valorPago)}</span>
            </div>

            <div class="linha" style="margin-top: 20px;">
              <strong>Por extenso:</strong> _________________________________________________
              <br>_________________________________________________________________
            </div>

            <div class="assinatura">
              <div class="linha">
                <strong>Assinatura do Freelancer:</strong>
                <div class="campo-assinatura"></div>
              </div>

              <div class="linha" style="margin-top: 40px;">
                <strong>Visto do Gerente:</strong>
                <div class="campo-assinatura"></div>
              </div>
            </div>

            <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
              <p>Este documento serve como comprovante de pagamento</p>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // Calcular totais
  const totalDevido = dadosPagamentos.reduce((sum, f) => sum + f.totalDevido, 0)
  const totalPago = dadosPagamentos.reduce((sum, f) => sum + f.totalPago, 0)
  const totalPendente = totalDevido - totalPago

  // Imprimir fichas individuais
  const handleImprimirFichas = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    const fichasHTML = dadosPagamentos.map(freelancer => `
      <div style="page-break-after: always; padding: 20px; border: 2px dashed #ccc; margin-bottom: 10px;">
        <h2 style="text-align: center; margin-bottom: 20px;">FICHA DE PAGAMENTO</h2>
        <div style="margin-bottom: 15px;">
          <strong>Nome:</strong> ${freelancer.nome}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>Setor:</strong> ${freelancer.setor}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>Período:</strong> ${getTituloPeriodo()}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>Dias Trabalhados:</strong> ${freelancer.dias} dia(s)
        </div>
        <div style="margin-bottom: 30px;">
          <strong style="font-size: 18px;">VALOR A RECEBER:</strong>
          <span style="font-size: 24px; color: green;">${formatCurrency(freelancer.saldo)}</span>
        </div>
        <div style="margin-top: 40px; border-top: 2px solid #000; padding-top: 20px;">
          <div style="margin-bottom: 10px;"><strong>Assinatura do Freelancer:</strong></div>
          <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 30px; height: 40px;"></div>
        </div>
        <div style="margin-top: 20px; border-top: 2px solid #000; padding-top: 20px;">
          <div style="margin-bottom: 10px;"><strong>Visto do Gerente:</strong></div>
          <div style="border-bottom: 1px solid #000; width: 100%; height: 40px;"></div>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
          Data: ___/___/______
        </div>
        <div style="border-top: 3px dashed #999; margin-top: 20px; padding-top: 10px; text-align: center; font-size: 11px; color: #999;">
          ✂ CORTAR AQUI ✂
        </div>
      </div>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Fichas de Pagamento - ${getTituloPeriodo()}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            @media print {
              body { margin: 0; }
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          ${fichasHTML}
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
          <h2 className="text-lg font-bold">Pagamentos</h2>
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
              Período
            </label>
            <select
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {tipoRelatorio === 'semanal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Início da Semana
              </label>
              <input
                type="date"
                value={semanaInicio}
                onChange={(e) => setSemanaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Resumo do Período */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h3 className="font-semibold text-green-900 mb-2">{getTituloPeriodo()}</h3>
          </div>

          {/* Cards de Totais */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-700 mb-1">Total Devido</p>
              <p className="text-sm font-bold text-blue-900">{formatCurrency(totalDevido)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-xs text-green-700 mb-1">Total Pago</p>
              <p className="text-sm font-bold text-green-900">{formatCurrency(totalPago)}</p>
            </div>
            <div className={`${totalPendente > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3 text-center`}>
              <p className={`text-xs ${totalPendente > 0 ? 'text-red-700' : 'text-gray-700'} mb-1`}>Pendente</p>
              <p className={`text-sm font-bold ${totalPendente > 0 ? 'text-red-900' : 'text-gray-900'}`}>{formatCurrency(totalPendente)}</p>
            </div>
          </div>

          {/* Lista de Pagamentos */}
          {dadosPagamentos.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Freelancers</h3>
              {dadosPagamentos.map((freelancer) => (
                <div
                  key={freelancer.id}
                  className={`border rounded-lg p-3 ${
                    freelancer.status === 'pago' ? 'bg-green-50 border-green-200' :
                    freelancer.status === 'parcial' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{freelancer.nome}</h4>
                      <p className="text-xs text-gray-600">{freelancer.setor} • {freelancer.dias} dia(s)</p>
                    </div>
                    {freelancer.status === 'pago' && (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                        <Check size={12} />
                        Pago
                      </span>
                    )}
                    {freelancer.status === 'parcial' && (
                      <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                        <AlertCircle size={12} />
                        Parcial
                      </span>
                    )}
                    {freelancer.status === 'pendente' && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                        <X size={12} />
                        Pendente
                      </span>
                    )}
                  </div>

                  <div className="text-sm space-y-1 mb-3">
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
                    {freelancer.saldo > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saldo devedor:</span>
                        <span className="font-semibold text-red-600">{formatCurrency(freelancer.saldo)}</span>
                      </div>
                    )}
                  </div>

                  {freelancer.saldo > 0 && (
                    <>
                      {registrandoPagamento === freelancer.id ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={valorPagamento}
                            onChange={(e) => setValorPagamento(e.target.value)}
                            placeholder="Valor do pagamento"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setValorPagamento(freelancer.saldo.toString())}
                              className="flex-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                              Pagar Total
                            </button>
                            <button
                              onClick={() => handleRegistrarPagamento(freelancer.id)}
                              className="flex-1 px-3 py-1.5 text-xs bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => {
                                setRegistrandoPagamento(null)
                                setValorPagamento('')
                              }}
                              className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRegistrandoPagamento(freelancer.id)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <DollarSign size={16} />
                          <span>Registrar Pagamento</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma programação encontrada para o período selecionado</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          {dadosPagamentos.length > 0 && (
            <button
              onClick={handleImprimirFichas}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer size={18} />
              <span>Imprimir Fichas Individuais</span>
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

export default PagamentosModal
