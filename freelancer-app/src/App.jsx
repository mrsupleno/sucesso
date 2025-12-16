import { useState } from 'react'
import { Calendar, Users, Building2, Save, FileText, DollarSign } from 'lucide-react'
import './App.css'
import SetoresTab from './components/SetoresTab'
import FreelancersTab from './components/FreelancersTab'
import ProgramacaoTab from './components/ProgramacaoTab'

function App() {
  const [activeTab, setActiveTab] = useState('setores')

  // Estados para dados
  const [setores, setSetores] = useState([
    { id: 1, nome: 'Salão', descricao: 'Atendimento ao público' },
    { id: 2, nome: 'Açaí', descricao: 'Preparação de açaí' },
    { id: 3, nome: 'Cozinha', descricao: 'Preparação de alimentos' }
  ])

  const [freelancers, setFreelancers] = useState([
    { id: 1, nome: 'Jorrana', telefone: '', cpf: '', valorDiaria: 100, setorId: 1 },
    { id: 2, nome: 'Luis', telefone: '', cpf: '', valorDiaria: 100, setorId: 1 },
    { id: 3, nome: 'Vitoria', telefone: '', cpf: '', valorDiaria: 100, setorId: 1 },
    { id: 4, nome: 'Hanayra', telefone: '', cpf: '', valorDiaria: 100, setorId: 1 },
    { id: 5, nome: 'Maike', telefone: '', cpf: '', valorDiaria: 80, setorId: 1 },
    { id: 6, nome: 'Igor', telefone: '', cpf: '', valorDiaria: 90, setorId: 1 },
    { id: 7, nome: 'Karlla', telefone: '', cpf: '', valorDiaria: 90, setorId: 2 },
    { id: 8, nome: 'Erica', telefone: '', cpf: '', valorDiaria: 90, setorId: 3 },
    { id: 9, nome: 'Marci', telefone: '', cpf: '', valorDiaria: 105, setorId: 3 },
    { id: 10, nome: 'Tayla', telefone: '', cpf: '', valorDiaria: 105, setorId: 3 },
    { id: 11, nome: 'Tais', telefone: '', cpf: '', valorDiaria: 100, setorId: 3 }
  ])

  const [programacao, setProgramacao] = useState({})

  const tabs = [
    { id: 'programacao', label: 'Programação', icon: Calendar },
    { id: 'freelancers', label: 'Freelancers', icon: Users },
    { id: 'setores', label: 'Setores', icon: Building2 }
  ]

  const handleSave = () => {
    console.log('Salvando dados...')
    alert('Dados salvos com sucesso!')
  }

  const handleRelatorio = () => {
    console.log('Gerando relatório...')
    alert('Relatório em desenvolvimento')
  }

  const handlePagamentos = () => {
    console.log('Abrindo pagamentos...')
    alert('Pagamentos em desenvolvimento')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-[448px] mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Controle de Freelancers</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[448px] mx-auto flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-[448px] mx-auto w-full px-4 py-4 pb-24">
        {activeTab === 'programacao' && (
          <ProgramacaoTab
            setores={setores}
            freelancers={freelancers}
            programacao={programacao}
            setProgramacao={setProgramacao}
          />
        )}
        {activeTab === 'freelancers' && (
          <FreelancersTab
            freelancers={freelancers}
            setFreelancers={setFreelancers}
            setores={setores}
          />
        )}
        {activeTab === 'setores' && (
          <SetoresTab
            setores={setores}
            setSetores={setSetores}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-[448px] mx-auto flex gap-2 px-4 py-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save size={18} />
            <span>Salvar</span>
          </button>
          <button
            onClick={handleRelatorio}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={18} />
            <span>Relatório</span>
          </button>
          <button
            onClick={handlePagamentos}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DollarSign size={18} />
            <span>Pagamentos</span>
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
