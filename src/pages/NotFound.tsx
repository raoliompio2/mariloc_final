import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Número 404 com efeito de gradiente */}
        <h1 className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-4">
          404
        </h1>

        {/* Mensagem principal */}
        <h2 className="text-2xl font-semibold text-white mb-6">
          Ops! Página não encontrada
        </h2>

        {/* Mensagem secundária */}
        <p className="text-gray-300 mb-8">
          A página que você está procurando pode ter sido removida, renomeada ou está temporariamente indisponível.
        </p>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary rounded-lg font-medium transition-all hover:bg-opacity-90 hover:transform hover:-translate-y-0.5"
          >
            <Home className="mr-2 h-5 w-5" />
            Página Inicial
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg font-medium transition-all hover:bg-white hover:text-primary hover:transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
          </button>
        </div>

        {/* Decoração de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full transform rotate-12 bg-gradient-to-b from-white/5 to-transparent" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full transform -rotate-12 bg-gradient-to-t from-white/5 to-transparent" />
        </div>
      </div>
    </div>
  );
}
