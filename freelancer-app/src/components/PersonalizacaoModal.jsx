import { useState } from 'react'
import { X, Palette, Upload, RotateCcw, Eye } from 'lucide-react'

function PersonalizacaoModal({ isOpen, onClose, personalizacao, onSave }) {
  const [formData, setFormData] = useState({
    corPrimaria: personalizacao?.corPrimaria || '#2563EB',
    corSecundaria: personalizacao?.corSecundaria || '#1e40af',
    logo: personalizacao?.logo || null
  })

  const [previewLogo, setPreviewLogo] = useState(personalizacao?.logo || null)

  const coresPreDefinidas = [
    { nome: 'Saborite Azul (Padrão)', primaria: '#2563EB', secundaria: '#1e40af' },
    { nome: 'Elza Amarelo', primaria: '#F59E0B', secundaria: '#D97706' },
    { nome: 'Verde Fresco', primaria: '#10B981', secundaria: '#059669' },
    { nome: 'Roxo Moderno', primaria: '#8B5CF6', secundaria: '#7C3AED' },
    { nome: 'Vermelho Vibrante', primaria: '#EF4444', secundaria: '#DC2626' },
    { nome: 'Rosa Suave', primaria: '#EC4899', secundaria: '#DB2777' }
  ]

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewLogo(reader.result)
        setFormData({ ...formData, logo: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoverLogo = () => {
    setPreviewLogo(null)
    setFormData({ ...formData, logo: null })
  }

  const aplicarCorPreDefinida = (cor) => {
    setFormData({
      ...formData,
      corPrimaria: cor.primaria,
      corSecundaria: cor.secundaria
    })
  }

  const resetarCores = () => {
    setFormData({
      ...formData,
      corPrimaria: '#2563EB',
      corSecundaria: '#1e40af'
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Palette size={20} />
            Personalização
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Logo da Empresa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Upload size={18} />
              Logo da Empresa
            </h3>

            <div className="flex flex-col items-center gap-4">
              {/* Preview da Logo */}
              <div className="w-48 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                {previewLogo ? (
                  <img src={previewLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Upload size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Nenhuma logo</p>
                  </div>
                )}
              </div>

              {/* Botões da Logo */}
              <div className="flex gap-2">
                <label className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload size={16} className="inline mr-2" />
                  {previewLogo ? 'Trocar Logo' : 'Adicionar Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                {previewLogo && (
                  <button
                    type="button"
                    onClick={handleRemoverLogo}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={16} className="inline mr-2" />
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cores Personalizadas */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                <Palette size={18} />
                Cores do Sistema
              </h3>
              <button
                type="button"
                onClick={resetarCores}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <RotateCcw size={14} />
                Resetar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Primária
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.corPrimaria}
                    onChange={(e) => setFormData({ ...formData, corPrimaria: e.target.value })}
                    className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.corPrimaria}
                    onChange={(e) => setFormData({ ...formData, corPrimaria: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="#2563EB"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Secundária
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.corSecundaria}
                    onChange={(e) => setFormData({ ...formData, corSecundaria: e.target.value })}
                    className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.corSecundaria}
                    onChange={(e) => setFormData({ ...formData, corSecundaria: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>

            {/* Cores Pré-definidas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temas Pré-definidos
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {coresPreDefinidas.map((cor, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => aplicarCorPreDefinida(cor)}
                    className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: cor.primaria }}
                      ></div>
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: cor.secundaria }}
                      ></div>
                    </div>
                    <span className="text-xs">{cor.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Eye size={18} />
              Visualização
            </h3>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header Preview */}
              <div
                className="text-white px-4 py-3"
                style={{ backgroundColor: formData.corPrimaria }}
              >
                <div className="flex items-center justify-between">
                  {previewLogo ? (
                    <img src={previewLogo} alt="Logo Preview" className="h-8 object-contain" />
                  ) : (
                    <h3 className="font-bold">Saborite</h3>
                  )}
                  <div className="text-sm">Preview</div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-4">
                <button
                  type="button"
                  className="px-4 py-2 text-white text-sm font-medium rounded-lg"
                  style={{ backgroundColor: formData.corPrimaria }}
                >
                  Botão Primário
                </button>
                <button
                  type="button"
                  className="ml-2 px-4 py-2 text-white text-sm font-medium rounded-lg"
                  style={{ backgroundColor: formData.corSecundaria }}
                >
                  Botão Secundário
                </button>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PersonalizacaoModal
