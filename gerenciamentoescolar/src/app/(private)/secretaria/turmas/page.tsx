'use client';

import React, { useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSecretariaData } from '@/hooks/shared';
import UFEMSidebar from '@/components/secretaria/home/UFEMSidebar';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Header from '@/components/secretaria/header';

export default function SecretariaTurmasPage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);
  const { secretariaData, loading, error } = useSecretariaData();

  const handleMenuClick = useCallback((itemId: string): void => {
    // Implementação real da navegação baseada no itemId
    const routes = {
      'alunos': '/secretaria/alunos',
      'home': '/secretaria/professor/home',
      'curso': '/secretaria/curso',
      'turmas': '/secretaria/turmas',
      'calendario': '/secretaria/calendario',
      'boletim': '/secretaria/boletim'
    };

    const route = routes[itemId as keyof typeof routes];
    if (route && window.location.pathname !== route) {
      window.location.href = route;
    }
  }, []);

  const handleSignOut = useCallback((): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  }, [signOut]);

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UFEMSidebar 
        onMenuItemClick={handleMenuClick}
        className="fixed left-0 top-0 z-40"
      />
      
      <main className="flex-1 ml-64 p-8" role="main">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <Header 
            title="Gerenciamento de Turmas"
            subtitle="Bem-vindo(a),"
            secretariaData={secretariaData}
            user={user}
            onSignOut={handleSignOut}
          />

          {/* Área Principal - Gestão de Turmas */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cadastro de Turmas
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Crie e gerencie turmas do sistema acadêmico
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Online</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73c1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1c-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1c.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-1.66 1.34-3 3-3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Gestão de Turmas
                </h3>
                <p className="text-gray-600 mb-6">
                  Funcionalidade em desenvolvimento. Sistema de turmas será implementado em breve.
                </p>

                {/* Preview das funcionalidades planejadas */}
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    
                    {/* Card - Criar Turma */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-blue-900 mb-2">Criar Turmas</h4>
                      <p className="text-sm text-blue-700">Cadastre novas turmas com informações detalhadas</p>
                    </div>

                    {/* Card - Vincular Alunos */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-green-900 mb-2">Vincular Alunos</h4>
                      <p className="text-sm text-green-700">Adicione e remova alunos das turmas</p>
                    </div>

                    {/* Card - Atribuir Professores */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-purple-900 mb-2">Atribuir Professores</h4>
                      <p className="text-sm text-purple-700">Defina professores responsáveis pelas turmas</p>
                    </div>

                    {/* Card - Horários */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-orange-900 mb-2">Gerenciar Horários</h4>
                      <p className="text-sm text-orange-700">Configure horários e cronogramas das aulas</p>
                    </div>

                    {/* Card - Relatórios */}
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
                      <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-red-900 mb-2">Relatórios</h4>
                      <p className="text-sm text-red-700">Visualize estatísticas e relatórios das turmas</p>
                    </div>

                    {/* Card - Comunicação */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6">
                      <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-teal-900 mb-2">Comunicação</h4>
                      <p className="text-sm text-teal-700">Envie avisos e mensagens para as turmas</p>
                    </div>

                  </div>

                  {/* Status de desenvolvimento */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-yellow-800">
                        Em desenvolvimento - Previsão: Próxima versão
                      </span>
                    </div>
                  </div>

                  {/* Estrutura básica do formulário futuro */}
                  <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                      Preview: Formulário de Cadastro de Turma
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
                      {/* Informações Básicas */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-800">Informações Básicas</h5>
                        
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Nome da Turma *</label>
                          <input 
                            type="text" 
                            placeholder="Ex: ADS 2024.1 - Turma A"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            disabled
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Curso *</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" disabled>
                            <option>Selecione um curso</option>
                            <option>Análise e Desenvolvimento de Sistemas</option>
                            <option>Administração</option>
                            <option>Contabilidade</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Período</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" disabled>
                              <option>Selecione</option>
                              <option>Matutino</option>
                              <option>Vespertino</option>
                              <option>Noturno</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Semestre/Ano</label>
                            <input 
                              type="text" 
                              placeholder="2024.1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                              disabled
                            />
                          </div>
                        </div>
                      </div>

                      {/* Configurações */}
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-800">Configurações</h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Capacidade Máxima</label>
                            <input 
                              type="number" 
                              placeholder="40"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                              disabled
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Sala</label>
                            <input 
                              type="text" 
                              placeholder="Sala 101"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                              disabled
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Professor Coordenador</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" disabled>
                            <option>Selecione um professor</option>
                            <option>Prof. João Silva</option>
                            <option>Prof. Maria Santos</option>
                            <option>Prof. Carlos Oliveira</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Data de Início</label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            disabled
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" disabled>
                            <option>Planejada</option>
                            <option>Em Andamento</option>
                            <option>Concluída</option>
                            <option>Cancelada</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Botões do formulário */}
                    <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                      <button 
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md opacity-50 cursor-not-allowed"
                        disabled
                      >
                        Cancelar
                      </button>
                      <button 
                        className="px-4 py-2 text-white bg-purple-500 rounded-md opacity-50 cursor-not-allowed"
                        disabled
                      >
                        Criar Turma
                      </button>
                    </div>

                    {/* Indicador de desenvolvimento */}
                    <div className="text-center mt-4">
                      <span className="text-xs text-gray-500 italic">
                        Este formulário será funcional na próxima versão do sistema
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}