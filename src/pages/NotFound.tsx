import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import type { RootState } from '../store';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed?: number;
  type?: 'cone' | 'barrel' | 'brick' | 'scaffold' | 'beam';
}

export function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const { theme, systemSettings } = useSelector((state: RootState) => state.theme);

  // Game state
  const gameState = useRef({
    player: {
      x: 50,
      y: 200,
      width: 30,
      height: 50,
      jumping: false,
      jumpForce: 0,
      frame: 0
    },
    obstacles: [] as GameObject[],
    ground: 250,
    gameSpeed: 5,
    gravity: 0.8,
    jumpPower: -15,
    lastObstacleTime: 0,
    animationFrame: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const state = gameState.current;

    function drawPlayer(ctx: CanvasRenderingContext2D) {
      const { player } = state;
      
      // Corpo (macacão azul)
      ctx.fillStyle = '#1E40AF';
      ctx.fillRect(player.x, player.y + 15, player.width, player.height - 15);
      
      // Cabeça
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath();
      ctx.arc(player.x + player.width/2, player.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Capacete
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(player.x + player.width/2, player.y + 8, 12, Math.PI, Math.PI * 2);
      ctx.fill();
      
      // Braços
      ctx.fillStyle = '#1E40AF';
      ctx.fillRect(player.x - 5, player.y + 20, 5, 20);
      ctx.fillRect(player.x + player.width, player.y + 20, 5, 20);
      
      // Pernas
      const legOffset = Math.sin(state.animationFrame * 0.2) * 5;
      ctx.fillRect(player.x + 5, player.y + player.height - 15, 8, 15);
      ctx.fillRect(player.x + player.width - 13, player.y + player.height - 15, 8, 15);
    }

    function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: GameObject) {
      switch(obstacle.type) {
        case 'cone':
          // Cone de trânsito laranja
          ctx.fillStyle = '#FB923C';
          ctx.beginPath();
          ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
          ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
          ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
          ctx.closePath();
          ctx.fill();
          // Faixas reflexivas
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(obstacle.x + 2, obstacle.y + obstacle.height - 10, obstacle.width - 4, 3);
          ctx.fillRect(obstacle.x + 4, obstacle.y + obstacle.height - 18, obstacle.width - 8, 3);
          break;
          
        case 'barrel':
          // Barril
          ctx.fillStyle = '#B91C1C';
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          // Detalhes do barril
          ctx.fillStyle = '#7F1D1D';
          ctx.fillRect(obstacle.x, obstacle.y + 5, obstacle.width, 5);
          ctx.fillRect(obstacle.x, obstacle.y + obstacle.height - 10, obstacle.width, 5);
          break;
          
        case 'brick':
          // Pilha de tijolos
          ctx.fillStyle = '#B45309';
          for(let i = 0; i < obstacle.height; i += 10) {
            for(let j = 0; j < obstacle.width; j += 20) {
              ctx.fillRect(obstacle.x + j, obstacle.y + i, 18, 8);
            }
          }
          break;
          
        case 'scaffold':
          // Andaime
          ctx.fillStyle = '#4B5563';
          ctx.fillRect(obstacle.x, obstacle.y, 5, obstacle.height);
          ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y, 5, obstacle.height);
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 5);
          ctx.fillRect(obstacle.x, obstacle.y + obstacle.height - 20, obstacle.width, 5);
          break;
          
        case 'beam':
          // Viga de metal
          ctx.fillStyle = '#6B7280';
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          // Detalhes da viga
          ctx.fillStyle = '#4B5563';
          for(let i = 5; i < obstacle.height; i += 15) {
            ctx.fillRect(obstacle.x, obstacle.y + i, obstacle.width, 2);
          }
          break;
      }
    }

    function drawGround(ctx: CanvasRenderingContext2D) {
      // Chão principal
<<<<<<< HEAD
      ctx.fillStyle = theme === 'dark' ? '#1F2937' : '#E5E7EB';
      ctx.fillRect(0, state.ground, canvas.width, 50);
      
      // Textura do chão
      ctx.fillStyle = theme === 'dark' ? '#374151' : '#D1D5DB';
=======
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, state.ground, canvas.width, 50);
      
      // Textura do chão
      ctx.fillStyle = '#44403C';
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
      const gridSize = 20;
      const offset = (state.animationFrame * state.gameSpeed) % gridSize;
      
      for (let x = -offset; x < canvas.width; x += gridSize) {
        ctx.fillRect(x, state.ground + 10, 10, 2);
        ctx.fillRect(x + 10, state.ground + 30, 10, 2);
      }
    }

    function updateGame() {
      if (!gameStarted || gameOver) return;

      state.animationFrame++;
      
      // Atualiza o jogador
      if (state.player.jumping) {
        state.player.jumpForce += state.gravity;
        state.player.y += state.player.jumpForce;

        if (state.player.y > state.ground - state.player.height) {
          state.player.y = state.ground - state.player.height;
          state.player.jumping = false;
          state.player.jumpForce = 0;
        }
      }

      // Gera novos obstáculos
      if (Date.now() - state.lastObstacleTime > 1500) {
        const obstacleTypes: GameObject['type'][] = ['cone', 'barrel', 'brick', 'scaffold', 'beam'];
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        let width = 30;
        let height = 40;
        
        switch(type) {
          case 'cone':
            width = 25;
            height = 35;
            break;
          case 'barrel':
            width = 35;
            height = 50;
            break;
          case 'brick':
            width = 60;
            height = 40;
            break;
          case 'scaffold':
            width = 40;
            height = 80;
            break;
          case 'beam':
            width = 20;
            height = 100;
            break;
        }

        state.obstacles.push({
          x: canvas.width,
          y: state.ground - height,
          width,
          height,
          type,
          speed: state.gameSpeed
        });
        state.lastObstacleTime = Date.now();
      }

      // Atualiza obstáculos
      state.obstacles = state.obstacles.filter(obstacle => {
        obstacle.x -= state.gameSpeed;
        
        // Verifica colisão
        if (
          state.player.x < obstacle.x + obstacle.width &&
          state.player.x + state.player.width > obstacle.x &&
          state.player.y < obstacle.y + obstacle.height &&
          state.player.y + state.player.height > obstacle.y
        ) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
          }
          return false;
        }

        return obstacle.x > -obstacle.width;
      });

      // Aumenta a velocidade gradualmente
      if (state.animationFrame % 500 === 0) {
        state.gameSpeed += 0.5;
      }

      // Atualiza pontuação
      setScore(prev => prev + 1);
    }

    function gameLoop() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenha o fundo
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
<<<<<<< HEAD
      gradient.addColorStop(0, theme === 'dark' ? '#111827' : '#F9FAFB');
      gradient.addColorStop(1, theme === 'dark' ? '#1F2937' : '#F3F4F6');
=======
      gradient.addColorStop(0, theme === 'dark' ? '#1F2937' : '#F3F4F6');
      gradient.addColorStop(1, theme === 'dark' ? '#111827' : '#E5E7EB');
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGround(ctx);
      drawPlayer(ctx);
      state.obstacles.forEach(obstacle => drawObstacle(ctx, obstacle));

      // Desenha a pontuação
<<<<<<< HEAD
      ctx.fillStyle = theme === 'dark' ? '#9CA3AF' : '#6B7280';
      ctx.font = '16px system-ui';
      ctx.fillText(`Pontos: ${score}`, 10, 25);
      ctx.fillText(`Recorde: ${highScore}`, canvas.width - 140, 25);
=======
      ctx.fillStyle = theme === 'dark' ? '#F3F4F6' : '#1F2937';
      ctx.font = '20px monospace';
      ctx.fillText(`Pontos: ${score}`, 10, 30);
      ctx.fillText(`Recorde: ${highScore}`, canvas.width - 150, 30);
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76

      updateGame();
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    if (gameStarted && !gameOver) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !state.player.jumping && gameStarted && !gameOver) {
        state.player.jumping = true;
        state.player.jumpForce = state.jumpPower;
      }
    };

    const handleTouch = () => {
      if (!state.player.jumping && gameStarted && !gameOver) {
        state.player.jumping = true;
        state.player.jumpForce = state.jumpPower;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameStarted, gameOver, score, highScore, theme]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setShowInstructions(false);
    gameState.current = {
      ...gameState.current,
      obstacles: [],
      gameSpeed: 5,
      lastObstacleTime: Date.now(),
      animationFrame: 0,
      player: {
        ...gameState.current.player,
        jumping: false,
        jumpForce: 0,
        y: 200
      }
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center p-4 mt-[64px]">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Coluna da esquerda: Mensagem 404 */}
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-block mb-8">
              {theme === 'dark' && systemSettings.dark_header_logo_url ? (
                <img
                  src={systemSettings.dark_header_logo_url}
                  alt="Logo"
                  className="h-[60px] w-auto"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.error('Erro ao carregar logo escura:', e);
                    const target = e.target as HTMLImageElement;
                    target.src = systemSettings.light_header_logo_url || '';
                  }}
                />
              ) : systemSettings.light_header_logo_url ? (
                <img
                  src={systemSettings.light_header_logo_url}
                  alt="Logo"
                  className="h-[60px] w-auto"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.error('Erro ao carregar logo clara:', e);
                  }}
                />
              ) : null}
            </Link>
            <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-4">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Ops! Página não encontrada
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Enquanto isso, que tal um desafio na obra?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Home className="mr-2 h-5 w-5" />
                Página Inicial
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar
              </button>
            </div>
          </div>

          {/* Coluna da direita: Jogo */}
          <div>
<<<<<<< HEAD
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              className="rounded-lg mb-2 w-full"
            />
            
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center opacity-75">
              Pressione ESPAÇO ou SETA PARA CIMA para pular | Toque na tela em dispositivos móveis
            </p>
            
            {gameOver && (
              <div className="text-center mt-4">
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                  Fim de Jogo!
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Pontuação: {score} | Recorde: {highScore}
                </p>
                <button
                  onClick={startGame}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Jogar Novamente
                </button>
              </div>
            )}
=======
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <canvas
                ref={canvasRef}
                width={600}
                height={300}
                className="bg-gray-100 dark:bg-gray-700 rounded-lg mb-2"
              />
              
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Pressione ESPAÇO ou SETA PARA CIMA para pular | Toque na tela em dispositivos móveis
              </p>
              
              {gameOver && (
                <div className="text-center mt-4">
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Fim de Jogo!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Pontuação: {score} | Recorde: {highScore}
                  </p>
                  <button
                    onClick={startGame}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Jogar Novamente
                  </button>
                </div>
              )}
            </div>
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
