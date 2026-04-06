import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

interface SearchResult {
  id: string;
  nome: string;
  telefone: string;
  status_funil: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/clientes/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelect = (cliente: SearchResult) => {
    onClose();
    // Navegar para o Kanban e opcionalmente abrir o modal do cliente
    // Como a navegação do react-router mantém estado, podemos passar o ID
    navigate('/clientes', { state: { openClienteId: cliente.id } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl glass-overlay rounded-2xl shadow-2xl overflow-hidden animate-slide-in"
           style={{ animationDuration: '150ms' }}
      >
        <div className="flex items-center px-4 py-3 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-0 text-slate-100 focus:ring-0 text-lg placeholder:text-slate-500 w-full"
            placeholder="Buscar por nome ou telefone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {isLoading && (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="text-center p-8 text-slate-400">
              <p>Nenhum cliente encontrado para "{query}"</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="space-y-1">
              {results.map((result, index) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left",
                      index === selectedIndex ? "bg-white/[0.06] border-white/[0.1] border shadow-sm" : "border border-transparent hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-medium shadow-inner",
                        index === selectedIndex ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white" : "bg-white/[0.05] text-slate-300"
                      )}>
                        {result.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{result.nome}</p>
                        <p className="text-sm text-slate-500 font-mono">{result.telefone}</p>
                      </div>
                    </div>
                    <StatusBadge status={result.status_funil} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!query && (
            <div className="flex flex-col items-center justify-center p-8 text-slate-500 gap-2">
              <Search className="w-8 h-8 opacity-20" />
              <p className="text-sm">Digite para pesquisar clientes</p>
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-white/[0.08] bg-black/20 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1] font-mono">↑↓</kbd> navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1] font-mono">Enter</kbd> selecionar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1] font-mono">Esc</kbd> fechar
          </span>
        </div>
      </div>
    </div>
  );
}
