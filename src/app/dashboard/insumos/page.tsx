'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Package, Plus, Search, Edit, Trash2, Filter, Download, Upload } from 'lucide-react'
import { convertFormDataToNumbers } from '@/lib/form-utils'

interface Insumo {
  id: string
  nome: string
  marca?: string
  fornecedor?: string
  fornecedorId?: string
  categoriaId: string
  unidadeCompraId: string
  pesoLiquidoGramas: number
  precoUnidade: number
  calorias?: number
  proteinas?: number
  carboidratos?: number
  gorduras?: number
  fibras?: number
  sodio?: number
  categoria: { nome: string }
  unidadeCompra: { nome: string; simbolo: string }
  fornecedorRel?: { nome: string }
}

interface Categoria {
  id: string
  nome: string
}

interface UnidadeMedida {
  id: string
  nome: string
  simbolo: string
}

interface Fornecedor {
  id: string
  nome: string
  ativo: boolean
}

export default function InsumosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    marca: '',
    fornecedor: '',
    fornecedorId: '',
    categoriaId: '',
    unidadeCompraId: '',
    pesoLiquidoGramas: '',
    precoUnidade: '',
    calorias: '',
    proteinas: '',
    carboidratos: '',
    gorduras: '',
    fibras: '',
    sodio: ''
  })

  useEffect(() => {
    fetchInsumos()
    fetchCategorias()
    fetchUnidades()
    fetchFornecedores()
  }, [])

  const fetchInsumos = async () => {
    try {
      const response = await fetch('/api/insumos')
      if (response.ok) {
        const data = await response.json()
        setInsumos(data)
      }
    } catch (error) {
      console.error('Error fetching insumos:', error)
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias-insumos')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data)
      }
    } catch (error) {
      console.error('Error fetching categorias:', error)
    }
  }

  const fetchUnidades = async () => {
    try {
      const response = await fetch('/api/unidades-medida')
      if (response.ok) {
        const data = await response.json()
        setUnidades(data)
      }
    } catch (error) {
      console.error('Error fetching unidades:', error)
    }
  }

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores')
      if (response.ok) {
        const data = await response.json()
        setFornecedores(data.filter((f: Fornecedor) => f.ativo))
      }
    } catch (error) {
      console.error('Error fetching fornecedores:', error)
    }
  }

  const handleOpenModal = (insumo?: Insumo) => {
    setEditingInsumo(insumo || null)
    if (insumo) {
      setFormData({
        nome: insumo.nome,
        marca: insumo.marca || '',
        fornecedor: insumo.fornecedor || '',
        fornecedorId: insumo.fornecedorId || '',
        categoriaId: insumo.categoriaId,
        unidadeCompraId: insumo.unidadeCompraId,
        pesoLiquidoGramas: insumo.pesoLiquidoGramas.toString(),
        precoUnidade: insumo.precoUnidade.toString(),
        calorias: insumo.calorias?.toString() || '',
        proteinas: insumo.proteinas?.toString() || '',
        carboidratos: insumo.carboidratos?.toString() || '',
        gorduras: insumo.gorduras?.toString() || '',
        fibras: insumo.fibras?.toString() || '',
        sodio: insumo.sodio?.toString() || ''
      })
    } else {
      setFormData({
        nome: '',
        marca: '',
        fornecedor: '',
        fornecedorId: '',
        categoriaId: '',
        unidadeCompraId: '',
        pesoLiquidoGramas: '',
        precoUnidade: '',
        calorias: '',
        proteinas: '',
        carboidratos: '',
        gorduras: '',
        fibras: '',
        sodio: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingInsumo(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const processedData = convertFormDataToNumbers(formData, [
        'pesoLiquidoGramas',
        'precoUnidade',
        'calorias',
        'proteinas',
        'carboidratos',
        'gorduras',
        'fibras',
        'sodio'
      ])

      const url = editingInsumo ? `/api/insumos/${editingInsumo.id}` : '/api/insumos'
      const method = editingInsumo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      })

      if (response.ok) {
        await fetchInsumos()
        handleCloseModal()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar insumo')
      }
    } catch (error) {
      console.error('Error saving insumo:', error)
      setError('Erro ao salvar insumo')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este insumo?')) return

    try {
      const response = await fetch(`/api/insumos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchInsumos()
      } else {
        alert('Erro ao excluir insumo')
      }
    } catch (error) {
      console.error('Error deleting insumo:', error)
      alert('Erro ao excluir insumo')
    }
  }

  const filteredInsumos = insumos.filter(insumo =>
    insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insumo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insumo.categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              Insumos
            </h1>
            <p className="text-slate-600 mt-2">Gerencie os ingredientes e matérias-primas</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" icon={Filter} size="sm">
              Filtros
            </Button>
            <Button variant="outline" icon={Download} size="sm">
              Exportar
            </Button>
            <Button 
              variant="primary" 
              icon={Plus} 
              onClick={() => handleOpenModal()}
            >
              Novo Insumo
            </Button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Input
              icon={Search}
              placeholder="Buscar insumos por nome, marca ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </div>
          
          <Card variant="elevated">
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-slate-900">{insumos.length}</div>
              <div className="text-sm text-slate-600">Total de insumos</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card variant="elevated">
          <CardHeader title="Lista de Insumos" />
          <CardContent padding="none">
            {filteredInsumos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg font-medium">
                  {searchTerm ? 'Nenhum insumo encontrado' : 'Nenhum insumo cadastrado'}
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Clique em "Novo Insumo" para começar'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Peso Líquido</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Custo/g</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInsumos.map((insumo) => (
                    <TableRow key={insumo.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{insumo.nome}</div>
                        {insumo.fornecedorRel && (
                          <div className="text-xs text-slate-500">{insumo.fornecedorRel.nome}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600">{insumo.marca || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {insumo.categoria.nome}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-900 font-medium">
                          {insumo.pesoLiquidoGramas}{insumo.unidadeCompra.simbolo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-900 font-medium">
                          R$ {insumo.precoUnidade.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600">
                          R$ {(insumo.precoUnidade / insumo.pesoLiquidoGramas).toFixed(4)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleOpenModal(insumo)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDelete(insumo.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingInsumo ? 'Editar Insumo' : 'Novo Insumo'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome *"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                fullWidth
              />

              <Input
                label="Marca"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                fullWidth
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Categoria *
                </label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                  required
                  className="block w-full px-4 py-3 text-slate-900 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Unidade de Compra *
                </label>
                <select
                  value={formData.unidadeCompraId}
                  onChange={(e) => setFormData({ ...formData, unidadeCompraId: e.target.value })}
                  required
                  className="block w-full px-4 py-3 text-slate-900 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma unidade</option>
                  {unidades.map((unidade) => (
                    <option key={unidade.id} value={unidade.id}>
                      {unidade.nome} ({unidade.simbolo})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Peso Líquido (g) *"
                type="number"
                step="0.01"
                value={formData.pesoLiquidoGramas}
                onChange={(e) => setFormData({ ...formData, pesoLiquidoGramas: e.target.value })}
                required
                fullWidth
              />

              <Input
                label="Preço por Unidade (R$) *"
                type="number"
                step="0.01"
                value={formData.precoUnidade}
                onChange={(e) => setFormData({ ...formData, precoUnidade: e.target.value })}
                required
                fullWidth
              />
            </div>

            {/* Informações Nutricionais */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Informações Nutricionais (opcionais)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input
                  label="Calorias (kcal/100g)"
                  type="number"
                  step="0.01"
                  value={formData.calorias}
                  onChange={(e) => setFormData({ ...formData, calorias: e.target.value })}
                  fullWidth
                />

                <Input
                  label="Proteínas (g/100g)"
                  type="number"
                  step="0.01"
                  value={formData.proteinas}
                  onChange={(e) => setFormData({ ...formData, proteinas: e.target.value })}
                  fullWidth
                />

                <Input
                  label="Carboidratos (g/100g)"
                  type="number"
                  step="0.01"
                  value={formData.carboidratos}
                  onChange={(e) => setFormData({ ...formData, carboidratos: e.target.value })}
                  fullWidth
                />

                <Input
                  label="Gorduras (g/100g)"
                  type="number"
                  step="0.01"
                  value={formData.gorduras}
                  onChange={(e) => setFormData({ ...formData, gorduras: e.target.value })}
                  fullWidth
                />

                <Input
                  label="Fibras (g/100g)"
                  type="number"
                  step="0.01"
                  value={formData.fibras}
                  onChange={(e) => setFormData({ ...formData, fibras: e.target.value })}
                  fullWidth
                />

                <Input
                  label="Sódio (mg/100g)"
                  type="number"
                  step="0.01"
                  value={formData.sodio}
                  onChange={(e) => setFormData({ ...formData, sodio: e.target.value })}
                  fullWidth
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                {editingInsumo ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

