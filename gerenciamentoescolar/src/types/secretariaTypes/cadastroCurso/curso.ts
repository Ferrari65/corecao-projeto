// src/types/secretariaTypes/cadastroCurso/curso.ts
import { UseFormReturn } from 'react-hook-form';
import type { CursoFormData, CursoDTO, CursoResponse } from '@/schemas'; // ✅ CORRIGIDO

// Renomeando CursoResponse para Curso para manter consistência
export type Curso = CursoResponse;

export interface CursoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface UseCursoFormReturn {
  form: UseFormReturn<CursoFormData>;
  onSubmit: (data: CursoFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

export interface UseCursoAPIReturn {
  createCurso: (data: CursoDTO) => Promise<CursoResponse>;
  fetchCursos: (secretariaId: string) => Promise<CursoResponse[]>;
  updateCurso: (id: string, data: Partial<CursoDTO>) => Promise<CursoResponse>;
  deleteCurso: (cursoId: string, secretariaId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface CursoListResponse {
  cursos: Curso[];
  total: number;
  page: number;
  limit: number;
}

export interface CursoFilters {
  nome?: string;
  situacao?: 'ATIVO' | 'INATIVO';
  orderBy?: 'nome' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface UseCursoListReturn {
  cursos: Curso[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  deleteCurso: (cursoId: string) => Promise<void>;
  clearError: () => void;
}