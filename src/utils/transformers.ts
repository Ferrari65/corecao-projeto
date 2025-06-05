// src/utils/transformers.ts - VERSÃO SIMPLIFICADA
import { 
  ProfessorFormData, 
  ProfessorDTO,
  CursoFormData, 
  CursoDTO,
  cleanCPF,
  cleanPhone
} from '@/schemas';

// ===== TRANSFORMERS PARA PROFESSOR =====
export const transformProfessorFormToDTO = (
  data: ProfessorFormData, 
  secretariaId: string
): ProfessorDTO => {
  const cpfLimpo = cleanCPF(data.cpf);
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);
  
  if (isNaN(numeroInt) || numeroInt <= 0) {
    throw new Error('Número deve ser um valor válido maior que zero');
  }

  return {
    nome: data.nome.trim(),
    CPF: cpfLimpo,
    email: data.email.trim().toLowerCase(),
    senha: data.senha,
    logradouro: data.logradouro.trim(),
    bairro: data.bairro.trim(),
    numero: numeroInt,
    cidade: data.cidade.trim(),
    UF: data.uf.toUpperCase(),
    sexo: data.sexo.toUpperCase() as 'M' | 'F',
    telefone: telefoneLimpo,
    data_nasc: data.data_nasc,
    situacao: 'ATIVO' as const,
    id_secretaria: secretariaId
  };
};

// ===== TRANSFORMERS PARA CURSO =====
export const transformCursoFormToDTO = (
  data: CursoFormData, 
  secretariaId: string
): CursoDTO => {
  const duracao = parseInt(data.duracao, 10);
  
  if (isNaN(duracao) || duracao <= 0 || duracao > 60) {
    throw new Error('Duração deve ser um número entre 1 e 60 meses');
  }

  return {
    nome: data.nome.trim(),
    duracao,
    id_secretaria: secretariaId,
    situacao: 'ATIVO',
    data_alteracao: new Date().toISOString().split('T')[0]
  };
};

// ===== VALIDADORES RÁPIDOS =====
export const validateProfessorFormData = (data: ProfessorFormData): string[] => {
  const errors: string[] = [];

  const requiredFields = [
    { field: 'nome', value: data.nome?.trim(), label: 'Nome' },
    { field: 'email', value: data.email?.trim(), label: 'Email' },
    { field: 'senha', value: data.senha, label: 'Senha' },
    { field: 'cpf', value: data.cpf, label: 'CPF' },
    { field: 'telefone', value: data.telefone, label: 'Telefone' },
    { field: 'data_nasc', value: data.data_nasc, label: 'Data de nascimento' },
    { field: 'sexo', value: data.sexo, label: 'Sexo' },
    { field: 'logradouro', value: data.logradouro?.trim(), label: 'Logradouro' },
    { field: 'bairro', value: data.bairro?.trim(), label: 'Bairro' },
    { field: 'numero', value: data.numero, label: 'Número' },
    { field: 'cidade', value: data.cidade?.trim(), label: 'Cidade' },
    { field: 'uf', value: data.uf, label: 'UF' }
  ];

  requiredFields.forEach(({ field, value, label }) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${label} é obrigatório`);
    }
  });

  // Validação específica do número
  if (data.numero && isNaN(parseInt(data.numero, 10))) {
    errors.push('Número deve ser um valor numérico válido');
  }

  // Validação de email
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Email deve ter um formato válido');
  }

  // Validação de CPF
  if (data.cpf && !isValidCPF(data.cpf)) {
    errors.push('CPF deve ter um formato válido');
  }

  return errors;
};

export const validateCursoFormData = (data: CursoFormData): string[] => {
  const errors: string[] = [];

  if (!data.nome?.trim()) {
    errors.push('Nome do curso é obrigatório');
  } else if (data.nome.trim().length < 3) {
    errors.push('Nome do curso deve ter pelo menos 3 caracteres');
  }

  if (!data.duracao) {
    errors.push('Duração é obrigatória');
  } else {
    const duracao = parseInt(data.duracao, 10);
    if (isNaN(duracao) || duracao <= 0 || duracao > 60) {
      errors.push('Duração deve ser um número entre 1 e 60 meses');
    }
  }

  return errors;
};

// ===== FUNÇÕES AUXILIARES =====
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidCPF = (cpf: string): boolean => {
  if (!cpf) return false;
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCPF.charAt(10));
};

// ===== FORMATADORES =====
export const formatCPF = (cpf: string): string => {
  const clean = cleanCPF(cpf);
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
};

export const formatPhone = (phone: string): string => {
  const clean = cleanPhone(phone);
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

// ===== ALIASES PARA COMPATIBILIDADE =====
export const formDataToDTO = transformProfessorFormToDTO;
export const formDataToCursoDTO = transformCursoFormToDTO;
export const validateFormData = validateProfessorFormData;