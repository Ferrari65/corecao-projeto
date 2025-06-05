import { UseFormReturn } from 'react-hook-form';
import type { 
  ProfessorFormData, 
  ProfessorDTO, 
  CursoFormData, 
  CursoDTO, 
  CursoResponse 
} from '@/schemas';

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface SecretariaData {
  nome: string;
  email: string;
  id_secretaria: string;
}

// =====  PROFESSOR =====
export interface Professor extends BaseEntity {
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

// =====  CURSO =====
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

// =====  FORMULÁRIOS =====
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

// =====  COMPONENTES UI =====
export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// =====  HEADER =====
export interface HeaderProps {
  title?: string;
  subtitle?: string;
  secretariaData?: SecretariaData | null;
  user: User;
  onSignOut: () => void;
  showSignOutButton?: boolean;
}

// =====  SIDEBAR =====
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export interface SidebarProps {
  className?: string;
  onMenuItemClick?: (itemId: string) => void;
}

// =====  API =====
export interface ApiError {
  message: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

// =====  HOOKS =====
export interface UseAsyncStateReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (fn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export interface UseSecretariaDataReturn {
  secretariaData: SecretariaData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// =====  SCHEMAS =====
export type { 
  ProfessorFormData, 
  ProfessorDTO, 
  CursoFormData, 
  CursoDTO, 
  CursoResponse 
} from '@/schemas';