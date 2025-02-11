import { Search, FileText, Truck } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Escolha a Máquina',
      description: 'Encontre a máquina ideal para seu projeto usando nossa busca inteligente'
    },
    {
      icon: FileText,
      title: 'Solicite um Orçamento',
      description: 'Receba um orçamento personalizado diretamente do proprietário'
    },
    {
      icon: Truck,
      title: 'Alugue com Segurança',
      description: 'Confirme o orçamento e combine a entrega do equipamento'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {steps.map((step, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-6 rounded-lg bg-card"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <step.icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
          <p className="text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  );
}
