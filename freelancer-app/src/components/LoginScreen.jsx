import { useState } from 'react'
import { LogIn, ChefHat } from 'lucide-react'

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Login padrão para testes: elza lanches
    if (email.toLowerCase() === 'elza' && senha === 'lanches') {
      onLogin({
        nome: 'Elza Lanches',
        email: 'elza@lanches.com'
      })
    } else {
      setError('Usuário ou senha incorretos. Use: elza / lanches')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <ChefHat size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Saborite Gestor de Freelancers
          </h1>
          <p className="text-blue-100">Gerencie sua equipe de forma simples</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <LogIn size={24} className="text-blue-600" />
              Acessar Conta
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo E-mail/Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Digite seu usuário"
                required
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Digite sua senha"
                required
              />
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botão Entrar */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Entrar
            </button>
          </form>

          {/* Informação de Teste */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                🔐 Acesso de Teste
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Usuário:</strong> elza</p>
                <p><strong>Senha:</strong> lanches</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-blue-100 text-sm">
          <p>© 2025 Saborite. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
