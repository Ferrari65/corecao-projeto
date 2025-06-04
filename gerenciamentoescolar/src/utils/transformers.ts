// src/utils/transformers.ts - VERSÃO OTIMIZADA
import { 
  ProfessorFormData, 
  ProfessorDTO,
  CursoFormData, 
  CursoDTO,
  cleanCPF,
  cleanPhone
} from '@/schemas';

// ===== CACHE PARA TRANSFORMAÇÕES =====
const transformCache = new Map<string, any>();

// ===== FUNÇÃO DE CACHE HELPER =====
const withCache = <T, R>(key: string, data: T, transformer: (data: T) => R): R => {
  const cacheKey = `${key}_${JSON.stringify(data)}`;
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey);
  }
  const result = transformer(data);
  transformCache.set(cacheKey, result);
  return result;
};

// ===== TRANSFORMERS PARA PROFESSOR =====
export const transformProfessorFormToDTO = (
  data: ProfessorFormData, 
  secretariaId: string
): ProfessorDTO => {
  return withCache('professor', { data, secretariaId }, ({ data, secretariaId }) => {
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
  });
};

// ===== TRANSFORMERS PARA CURSO =====
export const transformCursoFormToDTO = (
  data: CursoFormData, 
  secretariaId: string
): CursoDTO => {
  return withCache('curso', { data, secretariaId }, ({ data, secretariaId }) => {
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
  });
};

// ===== VALIDADORES RÁPIDOS =====
export const validateProfessorFormData = (data: ProfessorFormData): string[] => {
  const errors: string[] = [];

  const requiredFields = [
    { field: 'nome', value: data.nome?.trim() },
    { field: 'email', value: data.email?.trim() },
    { field: 'senha', value: data.senha },
    { field: 'cpf', value: data.cpf },
    { field: 'telefone', value: data.telefone },
    { field: 'data_nasc', value: data.data_nasc },
    { field: 'sexo', value: data.sexo },
    { field: 'logradouro', value: data.logradouro?.trim() },
    { field: 'bairro', value: data.bairro?.trim() },
    { field: 'numero', value: data.numero },
    { field: 'cidade', value: data.cidade?.trim() },
    { field: 'uf', value: data.uf }
  ];

  requiredFields.forEach(({ field, value }) => {
    if (!value) {
      errors.push(`${field} é obrigatório`);
    }
  });

  // Validação específica do número
  if (data.numero && isNaN(parseInt(data.numero, 10))) {
    errors.push('Número deve ser um valor numérico válido');
  }

  return errors;
};

export const validateCursoFormData = (data: CursoFormData): string[] => {
  const errors: string[] = [];

  if (!data.nome?.trim()) {
    errors.push('Nome do curso é obrigatório');
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

// ===== LIMPEZA DE CACHE =====
export const clearTransformCache = (): void => {
  transformCache.clear();
};

// ===== ALIASES PARA COMPATIBILIDADE =====
export const formDataToDTO = transformProfessorFormToDTO;
export const formDataToCursoDTO = transformCursoFormToDTO;
export const validateFormData = validateProfessorFormData;