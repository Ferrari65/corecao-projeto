// src/types/secretariaTypes/cadastroprofessor/professor.ts
import { UseFormReturn } from 'react-hook-form';
import type { ProfessorFormData, ProfessorDTO } from '@/schemas'; // ✅ CORRIGIDO

export interface Professor {
  id_professor: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  situacao: 'ATIVO' | 'INATIVO';
  logradouro: string;
  bairro: string;
  numero: number;
  cidade: string;
  uf: string;
  sexo: 'M' | 'F';
  data_nasc: string; 
  created_at?: string;
  updated_at?: string;
}

export interface ProfessorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface UseProfessorFormReturn {
  form: UseFormReturn<ProfessorFormData>;
  onSubmit: (data: ProfessorFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

export interface UseProfessorAPIReturn {
  createProfessor: (data: ProfessorDTO) => Promise<Professor>;
  fetchProfessores: (secretariaId: string) => Promise<Professor[]>;
  updateProfessor: (id: string, data: Partial<ProfessorDTO>) => Promise<Professor>;
  deleteProfessor: (id: string, secretariaId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

// Re-exportando as types do schema para manter compatibilidade
export type { ProfessorFormData, ProfessorDTO } from '@/schemas';