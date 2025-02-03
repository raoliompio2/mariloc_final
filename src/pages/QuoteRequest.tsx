import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import type { Machine, Accessory } from '../types/machine';
import { QuoteForm } from '../components/forms/QuoteForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

type Step = 'rental' | 'contact' | 'review';

interface FormData {
  rentalPeriod: string;
  deliveryAddress: string;
  name: string;
  phone: string;
  email: string;
  observations?: string;
}

export function QuoteRequest() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('rental');
  const [machine, setMachine] = useState<Machine & { owner_id: string } | null>(null);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    rentalPeriod: '',
    deliveryAddress: '',
    name: '',
    phone: '',
    email: ''
  });
  const [systemPhone, setSystemPhone] = useState('');

  useEffect(() => {
    const loadSystemSettings = async () => {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('phone')
        .single();
      
      if (settings?.phone) {
        // Remove todos os caracteres não numéricos e adiciona o código do país se não tiver
        let phone = settings.phone.replace(/\D/g, '');
        if (!phone.startsWith('55')) {
          phone = '55' + phone;
        }
        setSystemPhone(phone);
      }
    };

    loadSystemSettings();
  }, []);

  const formatWhatsAppMessage = (quote: any) => {
    const selectedAccessoriesList = accessories
      .filter(acc => selectedAccessories.includes(acc.id))
      .map(acc => `- ${acc.name}`)
      .join('\n');

    return `Ola! Gostaria de solicitar um orcamento:

Maquina: ${machine?.name}

${selectedAccessories.length > 0 ? `Acessorios:\n${selectedAccessoriesList}\n\n` : ''}Detalhes:
Periodo: ${formData.rentalPeriod}
Endereco: ${formData.deliveryAddress}
${formData.observations ? `Observacoes: ${formData.observations}\n` : ''}
Cliente:
Nome: ${formData.name}
Telefone: ${formData.phone}
Email: ${formData.email}

Orcamento #${quote.id}`;
  };

  console.log('URL params:', { slug });

  useEffect(() => {
    if (slug) {
      loadMachineAndAccessories();
      loadUserProfile();
    }
  }, [slug]);

  const loadMachineAndAccessories = async () => {
    try {
      console.log('Iniciando busca da máquina com slug:', slug);

      // Transformar o slug de volta para um nome similar
      const searchName = decodeURIComponent(slug!)
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      console.log('Nome para busca:', searchName);

      // Primeiro tenta buscar pelo nome exato
      let { data: machineData, error: machineError } = await supabase
        .from('machines')
        .select(`
          id,
          name,
          description,
          main_image_url,
          category_id,
          secondary_category_id,
          owner_id,
          created_at,
          category:categories!machines_category_id_fkey(*),
          secondary_category:categories!machines_secondary_category_id_fkey(*),
          technical_data(*)
        `)
        .eq('name', searchName);

      if (machineError) {
        console.error('Erro ao carregar máquina:', machineError);
        setError('Erro ao carregar os detalhes da máquina');
        setLoading(false);
        return;
      }

      // Se não encontrar com nome exato, tenta busca aproximada
      if (!machineData || machineData.length === 0) {
        const { data: fuzzyData, error: fuzzyError } = await supabase
          .from('machines')
          .select(`
            id,
            name,
            description,
            main_image_url,
            category_id,
            secondary_category_id,
            owner_id,
          created_at,
            category:categories!machines_category_id_fkey(*),
            secondary_category:categories!machines_secondary_category_id_fkey(*),
            technical_data(*)
          `)
          .ilike('name', `%${searchName}%`)
          .limit(1);

        if (fuzzyError) {
          console.error('Erro na busca aproximada:', fuzzyError);
          setError('Erro ao carregar os detalhes da máquina');
          setLoading(false);
          return;
        }

        if (!fuzzyData || fuzzyData.length === 0) {
          console.error('Nenhum dado encontrado para a máquina');
          setError('Máquina não encontrada');
          setLoading(false);
          return;
        }

        machineData = fuzzyData;
      }

      const machine = {
        ...machineData[0],
        mainImageUrl: machineData[0].main_image_url,
      };
      setMachine(machine);

      // Load accessories
      const { data: accessoryData, error: accessoryError } = await supabase
        .from('accessory_machines')
        .select(`
          accessory:accessories(
            id,
            name,
            description,
            main_image_url,
            price
          )
        `)
        .eq('machine_id', machine.id);

      if (accessoryError) {
        console.error('Erro ao carregar acessórios:', accessoryError);
      } else {
        const accessories = accessoryData
          .map(item => item.accessory)
          .filter(Boolean)
          .map(accessory => ({
            id: accessory.id,
            name: accessory.name,
            description: accessory.description,
            mainImageUrl: accessory.main_image_url,
            price: accessory.price
          }));
        setAccessories(accessories);
      }

      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar os detalhes da máquina');
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: profile.name || '',
            phone: profile.phone || '',
            email: profile.email,
            deliveryAddress: profile.address || ''
          }));
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  const handleAccessoryToggle = (accessoryId: string) => {
    setSelectedAccessories(prev => 
      prev.includes(accessoryId)
        ? prev.filter(id => id !== accessoryId)
        : [...prev, accessoryId]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep === 'rental') setCurrentStep('contact');
    else if (currentStep === 'contact') setCurrentStep('review');
  };

  const prevStep = () => {
    if (currentStep === 'contact') setCurrentStep('rental');
    else if (currentStep === 'review') setCurrentStep('contact');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!machine) {
        throw new Error('Máquina não encontrada');
      }

      // Get current user or create new account
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      let userId = user?.id;

      if (!user) {
        // Create new account for non-authenticated users
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: Math.random().toString(36).slice(-8),
          options: {
            data: {
              role: 'client'
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Erro ao criar conta');

        userId = authData.user.id;

        // Create profile for new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            address: formData.deliveryAddress,
            role: 'client'
          }]);

        if (profileError) throw profileError;
      }

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          machine_id: machine.id,
          client_id: userId,
          rental_period: formData.rentalPeriod,
          delivery_address: formData.deliveryAddress,
          observations: formData.observations || '',
          status: 'pending'
        })
        .select()
        .single();

      if (quoteError) {
        console.error('Erro ao criar orçamento:', quoteError);
        throw new Error('Erro ao criar orçamento');
      }
      if (!quote) throw new Error('Erro ao criar orçamento');

      // Add selected accessories
      if (selectedAccessories.length > 0) {
        const accessoryRelations = selectedAccessories.map(accessoryId => ({
          quote_id: quote.id,
          accessory_id: accessoryId
        }));

        const { error: accessoryError } = await supabase
          .from('quote_accessories')
          .insert(accessoryRelations);

        if (accessoryError) throw accessoryError;
      }

      // Redirecionar para WhatsApp em nova aba
      const whatsappMessage = formatWhatsAppMessage(quote);
      console.log('Mensagem do WhatsApp:', whatsappMessage);
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${systemPhone}&text=${encodedMessage}`;
      console.log('URL do WhatsApp:', whatsappUrl);
      window.open(whatsappUrl, '_blank');

      // Redirecionar para a página de orçamentos na aba atual
      navigate('/client/quotes');

    } catch (err) {
      console.error('Error submitting quote:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar orçamento. Por favor, tente novamente.');
      setCurrentStep('rental'); // Reset to first step on error
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner text="Carregando detalhes da máquina..." />
        </div>
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-text mb-4">{error || 'Máquina não encontrada'}</p>
            <button
              onClick={() => navigate(`/catalogo-de-produtos/produto/${slug}`)}
              className="text-primary hover:underline"
            >
              Voltar para o produto
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-8">
        <QuoteForm
          currentStep={currentStep}
          formData={formData}
          onInputChange={handleInputChange}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onSubmit={handleSubmit}
          submitting={submitting}
          machine={machine}
          accessories={accessories}
          selectedAccessories={selectedAccessories}
          onAccessoryToggle={handleAccessoryToggle}
        />
      </div>
    </div>
  );
}