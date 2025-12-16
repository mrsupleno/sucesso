import { useState, useEffect, useRef } from 'react'
import { Calendar, Users, Building2, CheckCircle, FileText, DollarSign, LogOut, ChevronDown, User, Building, UserCog, Shield, Info } from 'lucide-react'
import './App.css'
import LoginScreen from './components/LoginScreen'
import SetoresTab from './components/SetoresTab'
import FreelancersTab from './components/FreelancersTab'
import ProgramacaoTab from './components/ProgramacaoTab'
import RelatorioModal from './components/RelatorioModal'
import PagamentosModal from './components/PagamentosModal'
import EncerrarDiaModal from './components/EncerrarDiaModal'

function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('programacao')
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false)
  const [isPagamentosOpen, setIsPagamentosOpen] = useState(false)
  const [isEncerrarDiaOpen, setIsEncerrarDiaOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

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
  const [pagamentos, setPagamentos] = useState({})
  const [diasEncerrados, setDiasEncerrados] = useState({})

  const tabs = [
    { id: 'programacao', label: 'Convocados', icon: Calendar },
    { id: 'freelancers', label: 'Freelancers', icon: Users },
    { id: 'setores', label: 'Setores', icon: Building2 }
  ]

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setIsUserMenuOpen(false)
    if (confirm('Tem certeza que deseja sair?')) {
      setUser(null)
    }
  }

  const handlePerfilUsuario = () => {
    setIsUserMenuOpen(false)
    alert('Funcionalidade "Perfil do Usuário" em desenvolvimento')
  }

  const handleDadosEmpresa = () => {
    setIsUserMenuOpen(false)
    alert('Funcionalidade "Dados da Empresa" em desenvolvimento')
  }

  const handlePersonalizacaoEmpresa = () => {
    setIsUserMenuOpen(false)
    alert('Funcionalidade "Personalização da Empresa" em desenvolvimento')
  }

  const handleConfiguracoesPerfil = () => {
    setIsUserMenuOpen(false)
    alert('Funcionalidade "Configurações de Perfil" em desenvolvimento')
  }

  const handleEncerrarDia = () => {
    setIsEncerrarDiaOpen(true)
  }

  const handlePagamentos = () => {
    setIsPagamentosOpen(true)
  }

  const handleRelatorio = () => {
    setIsRelatorioOpen(true)
  }

  // Mostrar tela de login se não estiver autenticado
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-[448px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Saborite Gestor de Freelancers</h1>
            </div>

            {/* Menu do Usuário */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors text-sm"
              >
                <User size={16} />
                <span className="font-medium">{user.nome}</span>
                <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* Cabeçalho do Menu */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{user.nome}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  {/* Opções do Menu */}
                  <div className="py-2">
                    {/* Perfil do Usuário */}
                    <button
                      onClick={handlePerfilUsuario}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <User size={18} className="text-blue-600" />
                      <span>Meus Dados</span>
                    </button>

                    {/* Dados da Empresa */}
                    <button
                      onClick={handleDadosEmpresa}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <Building size={18} className="text-blue-600" />
                      <span>Dados da Empresa</span>
                    </button>

                    {/* Personalização */}
                    <button
                      onClick={handlePersonalizacaoEmpresa}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <UserCog size={18} className="text-blue-600" />
                      <span>Personalização</span>
                    </button>

                    {/* Perfil de Acesso */}
                    <button
                      onClick={handleConfiguracoesPerfil}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <Shield size={18} className="text-blue-600" />
                      <div className="flex flex-col items-start">
                        <span>Perfil de Acesso</span>
                        <span className="text-xs text-gray-500">Gerente</span>
                      </div>
                    </button>
                  </div>

                  {/* Divisor */}
                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Versão */}
                  <div className="px-4 py-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Info size={14} />
                      <span>Versão 1.0.0</span>
                    </div>
                  </div>

                  {/* Divisor */}
                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Sair */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Sair do Sistema</span>
                  </button>
                </div>
              )}
            </div>
          </div>
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
            diasEncerrados={diasEncerrados}
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
        <div className="max-w-[448px] mx-auto grid grid-cols-2 gap-2 px-4 py-3">
          <button
            onClick={() => setActiveTab('programacao')}
            className={`flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'programacao'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar size={16} />
            <span>Convocados</span>
          </button>
          <button
            onClick={handleEncerrarDia}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            <CheckCircle size={16} />
            <span>Encerrar Dia</span>
          </button>
          <button
            onClick={handlePagamentos}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DollarSign size={16} />
            <span>Pagamentos</span>
          </button>
          <button
            onClick={handleRelatorio}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={16} />
            <span>Relatório</span>
          </button>
        </div>
      </footer>

      {/* Modal de Relatório */}
      <RelatorioModal
        isOpen={isRelatorioOpen}
        onClose={() => setIsRelatorioOpen(false)}
        programacao={programacao}
        freelancers={freelancers}
        setores={setores}
        pagamentos={pagamentos}
      />

      {/* Modal de Pagamentos */}
      <PagamentosModal
        isOpen={isPagamentosOpen}
        onClose={() => setIsPagamentosOpen(false)}
        programacao={programacao}
        freelancers={freelancers}
        setores={setores}
        pagamentos={pagamentos}
        setPagamentos={setPagamentos}
      />

      {/* Modal de Encerrar Dia */}
      <EncerrarDiaModal
        isOpen={isEncerrarDiaOpen}
        onClose={() => setIsEncerrarDiaOpen(false)}
        programacao={programacao}
        setProgramacao={setProgramacao}
        freelancers={freelancers}
        setores={setores}
        diasEncerrados={diasEncerrados}
        setDiasEncerrados={setDiasEncerrados}
      />
    </div>
  )
}

export default App
