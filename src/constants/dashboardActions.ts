import { 
  Wrench, FileText, Package, RotateCcw, Grid, Hammer,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

export const quickActions: QuickAction[] = [
  {
    title: 'Máquinas',
    description: 'Gerencie seu catálogo de máquinas',
    icon: Wrench,
    path: '/machine/list',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Acessórios',
    description: 'Gerencie acessórios para máquinas',
    icon: Hammer,
    path: '/accessory/list',
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Categorias',
    description: 'Gerencie categorias de máquinas',
    icon: Grid,
    path: '/category/list',
    color: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Orçamentos',
    description: 'Acompanhe solicitações de orçamentos',
    icon: FileText,
    path: '/quote/list',
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Aluguéis',
    description: 'Gerencie aluguéis ativos',
    icon: Package,
    path: '/rental/list',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    title: 'Devoluções',
    description: 'Histórico de devoluções',
    icon: RotateCcw,
    path: '/rental/completed-returns',
    color: 'from-red-500 to-red-600'
  }
];
