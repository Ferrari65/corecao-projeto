'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CursoFormData } from '@/schemas'; // ✅ CORRIGIDO

interface CursoDataSectionProps {
  form: UseFormReturn<CursoFormData>;
}

export const CursoDataSection: React.FC<CursoDataSectionProps> = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-700 mb-4">Dados do Curso</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Nome do Curso */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Nome do Curso
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            {...register('nome')} // ✅ Zod já valida
            className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
              errors.nome 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'
            }`}
            placeholder="Ex: Análise e Desenvolvimento de Sistemas"
          />
          {errors.nome && (
            <span className="text-sm text-red-600">{errors.nome.message}</span>
          )}
          <span className="text-xs text-gray-500">Mínimo 3 caracteres, máximo 100</span>
        </div>

        {/* Duração */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Duração (em meses)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            {...register('duracao')} // ✅ Zod já valida
            className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
              errors.duracao 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'
            }`}
            placeholder="Ex: 24"
            min="1"
            max="60"
          />
          {errors.duracao && (
            <span className="text-sm text-red-600">{errors.duracao.message}</span>
          )}
          <span className="text-xs text-gray-500">Número inteiro entre 1 e 60</span>
        </div>
      </div>
    </div>
  );
};
