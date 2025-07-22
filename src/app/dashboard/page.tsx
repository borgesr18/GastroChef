'use client'

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { BarChart3, Package, FileText, Factory, ShoppingCart, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  insumos: number
  fichasTecnicas: number
  producoes: number
  produtos: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    insumos: 0,
    fichasTecnicas: 0,
    producoes: 0,
    produtos: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Fetch stats from APIs
        const [insumosRes, fichasRes, producoesRes, produtosRes] = await Promise.all([
          fetch('/api/insumos'),
          fetch('/api/fichas-tecnicas'),
          fetch('/api/producao'),
          fetch('/api/produtos')
        ])

        const [insumos, fichas, producoes, produtos] = await Promise.all([
          insumosRes.ok ? insumosRes.json() : [],
          fichasRes.ok ? fichasRes.json() : [],
          producoesRes.ok ? producoesRes.json() : [],
          produtosRes.ok ? produtosRes.json() : []
        ])

        setStats({
          insumos: Array.isArray(insumos) ? insumos.length : 0,
          fichasTecnicas: Array.isArray(fichas) ? fichas.length : 0,
          producoes: Array.isArray(producoes) ? producoes.length : 0,
          produtos: Array.isArray(produtos) ? produtos.length : 0
        })
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Erro ao carregar estatísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Visão geral do sistema GastroChef</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sistema Online</span>
            </div>
          </div>
        </div>

        {error && (
          <Card variant="outlined" className="border-red-200 bg-red-50">
            <CardContent className="flex items-center space-x-3 text-red-700">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="elevated" hover className="group">
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Insumos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.insumos}</p>
                <p className="text-xs text-slate-500">Cadastrados</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" hover className="group">
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Fichas Técnicas</p>
                <p className="text-2xl font-bold text-slate-900">{stats.fichasTecnicas}</p>
                <p className="text-xs text-slate-500">Receitas</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" hover className="group">
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Produções</p>
                <p className="text-2xl font-bold text-slate-900">{stats.producoes}</p>
                <p className="text-xs text-slate-500">Registradas</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" hover className="group">
            <CardContent className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Produtos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.produtos}</p>
                <p className="text-xs text-slate-500">Finais</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card variant="elevated">
            <CardHeader 
              title="Ações Rápidas" 
              subtitle="Acesse rapidamente as funcionalidades principais"
            />
            <CardContent className="space-y-3">
              <Link href="/dashboard/insumos">
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={Package} 
                  className="justify-start h-12 text-left"
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium">Cadastrar Insumo</div>
                    <div className="text-xs text-slate-500">Adicionar novo ingrediente</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/dashboard/fichas-tecnicas">
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={FileText} 
                  className="justify-start h-12 text-left"
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium">Nova Ficha Técnica</div>
                    <div className="text-xs text-slate-500">Criar nova receita</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/dashboard/producao">
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={Factory} 
                  className="justify-start h-12 text-left"
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium">Registrar Produção</div>
                    <div className="text-xs text-slate-500">Controlar produção</div>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Status do Sistema */}
          <Card variant="elevated">
            <CardHeader 
              title="Status do Sistema" 
              subtitle="Informações importantes e alertas"
            />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">Sistema Online</span>
                </div>
                <span className="text-xs text-green-600 font-medium">Ativo</span>
              </div>
              
              {stats.insumos === 0 && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Nenhum insumo cadastrado</span>
                  </div>
                  <span className="text-xs text-amber-600 font-medium">Atenção</span>
                </div>
              )}
              
              {stats.fichasTecnicas === 0 && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Nenhuma ficha técnica criada</span>
                  </div>
                  <span className="text-xs text-amber-600 font-medium">Atenção</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Atividades */}
        <Card variant="elevated">
          <CardHeader 
            title="Resumo de Atividades" 
            subtitle="Gráficos serão exibidos quando houver mais dados"
          />
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg font-medium">Gráficos serão exibidos quando houver mais dados</p>
              <p className="text-slate-400 text-sm mt-2">
                Comece cadastrando insumos e criando fichas técnicas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

