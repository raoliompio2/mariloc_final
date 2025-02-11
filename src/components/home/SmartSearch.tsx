import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useNavigate } from 'react-router-dom';

interface SmartSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SmartSearch({ onSearch, isLoading = false }: SmartSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      navigate(`/catalogo-de-produtos?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Do que você precisa? Ex: 'Preciso quebrar uma parede'"
          className="w-full h-14 pl-5 pr-32 text-lg rounded-full border-2 border-primary/20 focus:border-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          type="submit"
          className="absolute right-2 h-10 px-6 rounded-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>Buscas populares:</span>
        {['Quebrar parede', 'Limpar terreno', 'Construir casa'].map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => setSearchQuery(term)}
            className="hover:text-primary transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </form>
  );
}
