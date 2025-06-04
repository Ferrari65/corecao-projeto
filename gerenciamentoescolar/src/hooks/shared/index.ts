// src/hooks/shared/index.ts - HOOKS COMPARTILHADOS
import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { jwtDecode } from 'jwt-decode';

// ===== 1. HOOK DE DADOS DA SECRETARIA OTIMIZADO =====
interface SecretariaData {
  nome: string;
  email: string;
  id_secretaria: string;
}

interface UseSecretariaDataReturn {
  secretariaData: SecretariaData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache para dados da secretaria
const secretariaDataCache = new Map<string, { 
  data: SecretariaData; 
  timestamp: number;
}>();
const SECRETARIA_CACHE_DURATION = 10 * 60 * 1000; // 10 minutos (dados mudam pouco)

export const useSecretariaData = (): UseSecretariaDataReturn => {
  const [secretariaData, setSecretariaData] = useState<SecretariaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  // ===== OBTER ID DA SECRETARIA OTIMIZADO =====
  const getSecretariaId = useCallback((): string | null => {
    // 1. Prioridade: user.id
    if (user?.id) return user.id;

    // 2. localStorage
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('secretaria_id');
      if (storedId) return storedId;
    }

    // 3. Token JWT
    if (typeof window !== 'undefined') {
      try {
        const token = document.cookie.match(/nextauth\.token=([^;]+)/)?.[1];
        if (token) {
          const payload = jwtDecode<{ sub?: string; id?: string }>(token);
          return payload.sub || payload.id || null;
        }
      } catch (e) {
        console.error('Erro ao decodificar token:', e);
      }
    }

    return null;
  }, [user?.id]);

  // ===== FETCH COM CACHE AVANÇADO =====
  const fetchSecretariaData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const secretariaId = getSecretariaId();
      if (!secretariaId) {
        throw new Error('ID da secretaria não encontrado');
      }

      // Verificar cache primeiro
      const cached = secretariaDataCache.get(secretariaId);
      if (cached && Date.now() - cached.timestamp < SECRETARIA_CACHE_DURATION) {
        setSecretariaData(cached.data);
        setLoading(false);
        return;
      }
      
      const api = getAPIClient();
      const response = await api.get(`/secretaria/${secretariaId}`);
      
      const data = response.data;
      setSecretariaData(data);
      
      // Atualizar cache
      secretariaDataCache.set(secretariaId, {
        data,
        timestamp: Date.now()
      });
      
    } catch (err: any) {
      const { message } = handleApiError(err, 'SecretariaData');
      
      let errorMessage = message;
      if (err.message?.includes('ID da secretaria não encontrado')) {
        errorMessage = 'Sessão inválida. Por favor, faça login novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getSecretariaId]);

  const refetch = useCallback(async () => {
    // Limpar cache antes de buscar novamente
    const secretariaId = getSecretariaId();
    if (secretariaId) {
      secretariaDataCache.delete(secretariaId);
    }
    await fetchSecretariaData();
  }, [fetchSecretariaData, getSecretariaId]);

  // ===== EFFECT OTIMIZADO =====
  useEffect(() => {
    if (!user?.id) return;
    
    const timer = setTimeout(() => {
      fetchSecretariaData();
    }, 100);

    return () => clearTimeout(timer);
  }, [fetchSecretariaData, user?.id]);

  return useMemo(() => ({
    secretariaData,
    loading,
    error,
    refetch
  }), [secretariaData, loading, error, refetch]);
};

// ===== 2. HOOK DE CACHE GENÉRICO =====
interface CacheOptions {
  duration?: number; // em ms
  key?: string;
}

export const useCache = <T>(
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
) => {
  const { duration = 5 * 60 * 1000, key = 'default' } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache estático para este hook
  const cache = useMemo(() => new Map<string, { data: T; timestamp: number }>(), []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar cache
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < duration) {
        setData(cached.data);
        setLoading(false);
        return cached.data;
      }

      // Buscar dados
      const result = await fetchFn();
      setData(result);

      // Atualizar cache
      cache.set(key, { data: result, timestamp: Date.now() });

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao buscar dados';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, cache, key, duration]);

  const clearCache = useCallback(() => {
    cache.delete(key);
  }, [cache, key]);

  const refetch = useCallback(async () => {
    clearCache();
    return await fetchData();
  }, [clearCache, fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    refetch,
    clearCache
  };
};

// ===== 3. HOOK DE DEBOUNCE =====
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ===== 4. HOOK DE LOADING STATES UNIFICADO =====
interface UseLoadingReturn {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

export const useLoading = (initialState = false): UseLoadingReturn => {
  const [loading, setLoading] = useState(initialState);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
};

// ===== 5. HOOK DE ERROR HANDLING UNIFICADO =====
interface UseErrorReturn {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  withErrorHandling: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

export const useError = (): UseErrorReturn => {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const withErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      clearError();
      return await fn();
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      console.error('Error caught by useError:', err);
      return null;
    }
  }, [clearError]);

  return { error, setError, clearError, withErrorHandling };
};

// ===== 6. HOOK DE ASYNC STATE COMBINADO =====
interface UseAsyncStateReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (fn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export const useAsyncState = <T>(): UseAsyncStateReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const { loading, withLoading } = useLoading();
  const { error, withErrorHandling, clearError } = useError();

  const execute = useCallback(async (fn: () => Promise<T>): Promise<T | null> => {
    return withLoading(async () => {
      const result = await withErrorHandling(fn);
      if (result !== null) {
        setData(result);
      }
      return result;
    });
  }, [withLoading, withErrorHandling]);

  const reset = useCallback(() => {
    setData(null);
    clearError();
  }, [clearError]);

  return { data, loading, error, execute, reset };
};

// ===== 7. HOOK DE PAGINAÇÃO (para futuras listas) =====
interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  getOffset: () => number;
  getLimit: () => number;
}

export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const { initialPage = 1, initialPageSize = 10 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const getOffset = useCallback(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const getLimit = useCallback(() => {
    return pageSize;
  }, [pageSize]);

  return {
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    getOffset,
    getLimit
  };
};

// ===== 8. CACHE UTILITIES GLOBAIS =====
export const sharedCacheUtils = {
  clearSecretariaCache: () => secretariaDataCache.clear(),
  clearAllSharedCache: () => {
    secretariaDataCache.clear();
  },
  getSecretariaCacheSize: () => secretariaDataCache.size,
};

// ===== EXPORTS PRINCIPAIS =====
export default {
  useSecretariaData,
  useCache,
  useDebounce,
  useLoading,
  useError,
  useAsyncState,
  usePagination,
  sharedCacheUtils
};