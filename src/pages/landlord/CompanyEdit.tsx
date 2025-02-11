import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CompanyHero, CompanyMissionVisionValue, CompanyTimeline, CompanyValue, CompanySector, CompanyCertification } from '../../types/company'
import { Loader2, Upload, Eye, Save, Plus, Trash2, Target, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useToast } from '../../components/ui/use-toast'
import { Card } from '../../components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useCompanyContent } from '../../hooks/useCompanyContent'
import { CompanyHero as CompanyHeroPreview } from '../../components/company/CompanyHero'
import { MissionVisionValues } from '../../components/company/MissionVisionValues'
import { CompanyTimeline as CompanyTimelinePreview } from '../../components/company/CompanyTimeline'
import { ValueForm } from '../../components/company/edit/ValueForm'
import { SectorForm } from '../../components/company/edit/SectorForm'
import { CertificationForm } from '../../components/company/edit/CertificationForm'
import { ContentList } from '../../components/company/edit/ContentList'
import { cn } from '../../lib/utils'

// Schemas
const heroSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().min(1, 'Subtítulo é obrigatório'),
  video_url: z.string().url('URL inválida').optional().or(z.literal('')),
  poster_url: z.string().url('URL inválida').min(1, 'Imagem de fundo é obrigatória')
})

const missionVisionValueSchema = z.object({
  type: z.enum(['mission', 'vision', 'values']),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  icon: z.string().min(1, 'Ícone é obrigatório')
})

const timelineSchema = z.object({
  year: z.string().min(1, 'Ano é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória')
})

const valueSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  image_url: z.string().url('URL inválida').min(1, 'Imagem é obrigatória'),
  icon: z.string().min(1, 'Ícone é obrigatório')
})

const sectorSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  image_url: z.string().url('URL inválida').min(1, 'Imagem é obrigatória')
})

const certificationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  image_url: z.string().url('URL inválida').min(1, 'Imagem é obrigatória')
})

function CompanyEdit() {
  const { toast } = useToast()
  const { hero, missionVisionValues, timeline, values, sectors, certifications, isLoading, refetch: refetchHero } = useCompanyContent()

  // All state declarations
  const [activeTab, setActiveTab] = useState<TabValue>("hero")
  const [saving, setSaving] = useState(false)
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null)
  const [heroData, setHeroData] = useState<CompanyHero[]>([])
  const [mvvData, setMvvData] = useState<CompanyMissionVisionValue[]>([])
  const [timelineData, setTimelineData] = useState<CompanyTimeline[]>([])
  const [valuesData, setValuesData] = useState<CompanyValue[]>([])
  const [sectorsData, setSectorsData] = useState<CompanySector[]>([])
  const [certificationsData, setCertificationsData] = useState<CompanyCertification[]>([])

  // All form declarations
  const heroForm = useForm<z.infer<typeof heroSchema>>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      video_url: '',
      poster_url: ''
    }
  })

  const mvvForm = useForm<z.infer<typeof missionVisionValueSchema>>({
    resolver: zodResolver(missionVisionValueSchema),
    defaultValues: {
      type: 'mission',
      title: '',
      description: '',
      icon: ''
    }
  })

  const timelineForm = useForm<z.infer<typeof timelineSchema>>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      year: '',
      title: '',
      description: ''
    }
  })

  const valueForm = useForm<z.infer<typeof valueSchema>>({
    resolver: zodResolver(valueSchema),
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
      icon: ''
    }
  })

  const sectorForm = useForm<z.infer<typeof sectorSchema>>({
    resolver: zodResolver(sectorSchema),
    defaultValues: {
      title: '',
      image_url: ''
    }
  })

  const certificationForm = useForm<z.infer<typeof certificationSchema>>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: '',
      image_url: ''
    }
  })

  // All useEffect hooks
  useEffect(() => {
    if (hero && hero.length > 0 && hero[0].poster_url) {
      setHeroImages([hero[0].poster_url])
    }
  }, [hero])

  useEffect(() => {
    if (!isLoading) {
      // Update all form data at once when data is loaded
      if (hero && hero.length > 0) {
        heroForm.reset(hero[0])
        setHeroData(hero)
      }
      if (missionVisionValues) {
        setMvvData(missionVisionValues)
      }
      if (timeline) {
        setTimelineData(timeline)
      }
      if (values) {
        setValuesData(values)
      }
      if (sectors) {
        setSectorsData(sectors)
      }
      if (certifications) {
        setCertificationsData(certifications)
      }
    }
  }, [isLoading, hero, missionVisionValues, timeline, values, sectors, certifications])

  // All save functions
  const saveHero = async (data: z.infer<typeof heroSchema>) => {
    setSaving(true)
    try {
      if (hero && hero.length > 0) {
        const { error } = await supabase
          .from('company_hero')
          .update({
            title: data.title,
            subtitle: data.subtitle,
            video_url: data.video_url || null,
            poster_url: data.poster_url
          })
          .eq('id', hero[0].id)

        if (error) throw error

        setToastMessage({
          type: 'success',
          message: 'Hero atualizado com sucesso!'
        })
      } else {
        const { error } = await supabase
          .from('company_hero')
          .insert({
            title: data.title,
            subtitle: data.subtitle,
            video_url: data.video_url || null,
            poster_url: data.poster_url
          })

        if (error) throw error

        setToastMessage({
          type: 'success',
          message: 'Hero criado com sucesso!'
        })
      }
      refetchHero()
    } catch (error) {
      console.error('Error saving hero:', error)
      setToastMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao salvar hero'
      })
    } finally {
      setSaving(false)
    }
  }

  const saveItem = async (table: string, data: any, form: any, successMessage: string) => {
    setSaving(true)
    try {
      const { error } = await supabase.from(table).insert(data)
      if (error) throw error
      form.reset()
      setToastMessage({ type: 'success', message: successMessage })
      refetchHero()
    } catch (error) {
      console.error(`Error saving ${table}:`, error)
      setToastMessage({
        type: 'error',
        message: error instanceof Error ? error.message : `Erro ao salvar ${table}`
      })
    } finally {
      setSaving(false)
    }
  }

  const saveMVV = async (data: any) => {
    await saveItem('company_mission_vision_values', data, mvvForm, 'Item adicionado com sucesso!')
  }

  const saveTimeline = async (data: any) => {
    await saveItem('company_timeline', data, timelineForm, 'Marco temporal adicionado com sucesso!')
  }

  const saveValue = async (data: any) => {
    await saveItem('company_values', data, valueForm, 'Valor adicionado com sucesso!')
  }

  const saveSector = async (data: any) => {
    await saveItem('company_sectors', data, sectorForm, 'Setor adicionado com sucesso!')
  }

  const saveCertification = async (data: any) => {
    await saveItem('company_certifications', data, certificationForm, 'Certificação adicionada com sucesso!')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando informações...</p>
      </div>
    );
  }

  // Upload de imagens
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, isHero: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo deve ser uma imagem');
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 5MB');
      }

      setSaving(true);

      // Sanitize file name - remove special characters and spaces
      const sanitizedName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-zA-Z0-9.-]/g, '-') // Replace special chars with hyphen
        .toLowerCase();

      // Generate unique file name
      const timestamp = Date.now();
      const fileName = `${timestamp}-${sanitizedName}`;
      const filePath = `hero/${fileName}`;

      // Convert file to buffer
      const fileBuffer = await file.arrayBuffer();

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('machine-images')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('machine-images')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Erro ao gerar URL pública da imagem');
      }

      // Atualizar o campo poster_url do formulário
      if (isHero) {
        heroForm.setValue('poster_url', publicUrl);
        setHeroImages(prev => [...prev, publicUrl]);
      }

      setToastMessage({
        type: 'success',
        message: 'Imagem carregada com sucesso!'
      });

      // Recarregar dados do hero
      refetchHero();

    } catch (error) {
      console.error('Error processing image:', error);
      setToastMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao processar imagem'
      });
    } finally {
      setSaving(false);
      // Limpar o input de arquivo
      e.target.value = '';
    }
  };

  // Excluir imagem
  const handleDeleteImage = async (imageUrl: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      setSaving(true);
      
      // Extrair o caminho do arquivo da URL
      const urlParts = imageUrl.split('/');
      const filePath = `hero/${urlParts[urlParts.length - 1]}`;

      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('machine-images')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Atualizar o estado local
      setHeroImages(prev => prev.filter(url => url !== imageUrl));
      
      // Se a imagem excluída era a atual do hero, limpar o campo
      if (heroForm.getValues('poster_url') === imageUrl) {
        heroForm.setValue('poster_url', '');
      }

      setToastMessage({
        type: 'success',
        message: 'Imagem excluída com sucesso!'
      });

      // Recarregar dados do hero
      refetchHero();

    } catch (error) {
      console.error('Error deleting image:', error);
      setToastMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao excluir imagem'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Toast de feedback */}
      {toastMessage && (
        <div 
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300",
            toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          )}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toastMessage.message}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between px-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Página da Empresa</h1>
              <p className="text-sm text-gray-500">Gerencie o conteúdo institucional</p>
            </div>
            <Button 
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => window.open('/company', '_blank')}
            >
              <Eye className="h-4 w-4" />
              Visualizar Página
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Navigation */}
          <Card className="p-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start gap-1 bg-gray-50/50 p-1">
                <TabsTrigger 
                  value="hero" 
                  className="gap-2 data-[state=active]:bg-white"
                >
                  Hero
                </TabsTrigger>
                <TabsTrigger 
                  value="mvv" 
                  className="gap-2 data-[state=active]:bg-white"
                >
                  Missão, Visão e Valores
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className="gap-2 data-[state=active]:bg-white"
                >
                  Timeline
                </TabsTrigger>
                <TabsTrigger 
                  value="values" 
                  className="gap-2 data-[state=active]:bg-white"
                >
                  Valores
                </TabsTrigger>
                <TabsTrigger 
                  value="sectors" 
                  className="gap-2 data-[state=active]:bg-white"
                >
                  Setores
                </TabsTrigger>
                <TabsTrigger 
                  value="certifications" 
                  className="gap-2 data-[state=active]:bg-white"
                >
                  Certificações
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <div className="mt-6 space-y-6">
                <TabsContent value="hero">
                  <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
                    <div className="space-y-6">
                      {/* Form Card */}
                      <Card className="p-6">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                          <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-gray-900">Hero</h2>
                            <p className="text-sm text-gray-500">Configure a seção principal da sua página</p>
                          </div>
                        </div>

                        <Form {...heroForm}>
                          <form onSubmit={heroForm.handleSubmit(saveHero)} className="space-y-6">
                            <div className="grid gap-6">
                              <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                  control={heroForm.control}
                                  name="title"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700 font-medium">Título</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          className="h-10 border-gray-200 focus:border-primary" 
                                          placeholder="Ex: Construindo o Futuro" 
                                        />
                                      </FormControl>
                                      <FormMessage className="text-red-500" />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={heroForm.control}
                                  name="subtitle"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700 font-medium">Subtítulo</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          className="h-10 border-gray-200 focus:border-primary" 
                                          placeholder="Ex: Há mais de 25 anos..." 
                                        />
                                      </FormControl>
                                      <FormMessage className="text-red-500" />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={heroForm.control}
                                name="video_url"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">
                                      URL do Vídeo
                                      <span className="text-xs font-normal text-gray-500 ml-1">(opcional)</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="url" 
                                        className="h-10 border-gray-200 focus:border-primary" 
                                        placeholder="URL do vídeo de fundo" 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={heroForm.control}
                                name="poster_url"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Imagem de Fundo</FormLabel>
                                    <div className="space-y-4">
                                      {/* Grid de imagens existentes */}
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {heroImages.map((url, index) => (
                                          <div key={url} className="relative group">
                                            <img
                                              src={url}
                                              alt={`Hero ${index + 1}`}
                                              className={cn(
                                                "w-full h-40 object-cover rounded-xl shadow-md cursor-pointer transition-all duration-200",
                                                field.value === url ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary/50"
                                              )}
                                              onClick={() => heroForm.setValue('poster_url', url)}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteImage(url)}
                                              className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        ))}
                                        
                                        {/* Botão de upload */}
                                        <label className="cursor-pointer group">
                                          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary transition-colors duration-200 bg-gray-50 group-hover:bg-gray-100">
                                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                                            <span className="mt-2 text-sm text-gray-500 group-hover:text-primary transition-colors duration-200">
                                              Adicionar imagem
                                            </span>
                                          </div>
                                          <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={(e) => handleImageChange(e, true)}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>

                                      {/* Preview do hero */}
                                      {field.value && (
                                        <div className="mt-6">
                                          <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                                          <div className="relative w-full h-[200px] rounded-xl overflow-hidden">
                                            <CompanyHeroPreview
                                              data={{
                                                title: heroForm.watch('title'),
                                                subtitle: heroForm.watch('subtitle'),
                                                video_url: heroForm.watch('video_url'),
                                                poster_url: field.value
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <FormMessage className="text-red-500" />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                              <Button 
                                type="submit" 
                                disabled={saving}
                                className="min-w-[140px]"
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Hero
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </Card>
                    </div>

                    {/* Preview Card */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
                          <p className="text-sm text-gray-500">Visualização em tempo real</p>
                        </div>
                      </div>
                      <Card className="overflow-hidden border-0 shadow-sm">
                        <CompanyHeroPreview data={heroForm.getValues() as CompanyHero} />
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mvv">
                  <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
                    <div className="space-y-6">
                      <Card className="p-6">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                          <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-gray-900">Missão, Visão e Valores</h2>
                            <p className="text-sm text-gray-500">Defina os princípios da sua empresa</p>
                          </div>
                        </div>

                        <Form {...mvvForm}>
                          <form onSubmit={mvvForm.handleSubmit(saveMVV)} className="space-y-6">
                            <div className="grid gap-6">
                              <FormField
                                control={mvvForm.control}
                                name="type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Tipo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-10 border-gray-200">
                                          <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="mission">Missão</SelectItem>
                                        <SelectItem value="vision">Visão</SelectItem>
                                        <SelectItem value="values">Valores</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage className="text-red-500" />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={mvvForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Título</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        className="h-10 border-gray-200 focus:border-primary" 
                                        placeholder="Ex: Nossa Missão" 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={mvvForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Descrição</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        className="min-h-[120px] border-gray-200 focus:border-primary resize-none" 
                                        placeholder="Descreva o item..." 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={mvvForm.control}
                                name="icon"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">
                                      Ícone
                                      <span className="text-xs font-normal text-gray-500 ml-1">(opcional)</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        className="h-10 border-gray-200 focus:border-primary" 
                                        placeholder="Nome do ícone" 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                              <Button 
                                type="submit" 
                                disabled={saving}
                                className="min-w-[140px]"
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Adicionar Item
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold text-gray-900">Itens Cadastrados</h2>
                          <p className="text-sm text-gray-500">Gerencie os itens existentes</p>
                        </div>
                      </div>

                      <ContentList
                        items={missionVisionValues || []}
                        renderItem={(item) => (
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {item.type === 'mission' ? 'Missão' : item.type === 'vision' ? 'Visão' : 'Valores'}
                              </span>
                              {item.icon && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  {item.icon}
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                          </div>
                        )}
                        onDelete={(id) => deleteItem('company_mission_vision_values', id)}
                        gridCols="grid-cols-1"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline">
                  <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
                    <div className="space-y-6">
                      <Card className="p-6">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                          <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
                            <p className="text-sm text-gray-500">Adicione marcos importantes da sua empresa</p>
                          </div>
                        </div>

                        <Form {...timelineForm}>
                          <form onSubmit={timelineForm.handleSubmit(saveTimeline)} className="space-y-6">
                            <div className="grid gap-6">
                              <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                  control={timelineForm.control}
                                  name="year"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700 font-medium">Ano</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          className="h-10 border-gray-200 focus:border-primary" 
                                          placeholder="Ex: 1995" 
                                        />
                                      </FormControl>
                                      <FormMessage className="text-red-500" />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={timelineForm.control}
                                  name="title"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-700 font-medium">Título</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          className="h-10 border-gray-200 focus:border-primary" 
                                          placeholder="Ex: Fundação da Empresa" 
                                        />
                                      </FormControl>
                                      <FormMessage className="text-red-500" />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={timelineForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Descrição</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        className="min-h-[120px] border-gray-200 focus:border-primary resize-none" 
                                        placeholder="Descreva o marco temporal..." 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                              <Button 
                                type="submit" 
                                disabled={saving}
                                className="min-w-[140px]"
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Adicionar Marco
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold text-gray-900">Marcos Cadastrados</h2>
                          <p className="text-sm text-gray-500">Gerencie os marcos existentes</p>
                        </div>
                      </div>

                      <ContentList
                        items={timeline || []}
                        renderItem={(item) => (
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {item.year}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                          </div>
                        )}
                        onDelete={(id) => deleteItem('company_timeline', id)}
                        gridCols="grid-cols-1"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="values">
                  <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
                    <div className="space-y-6">
                      <Card className="p-6">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                          <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-gray-900">Valores</h2>
                            <p className="text-sm text-gray-500">Adicione os valores que representam sua empresa</p>
                          </div>
                        </div>

                        <ValueForm
                          form={valueForm}
                          onSubmit={saveValue}
                          saving={saving}
                          handleImageChange={handleImageChange}
                        />
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold text-gray-900">Valores Cadastrados</h2>
                          <p className="text-sm text-gray-500">Gerencie os valores existentes</p>
                        </div>
                      </div>

                      <ContentList
                        items={values || []}
                        renderItem={(item) => (
                          <div className="group relative">
                            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                              <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                                <img 
                                  src={item.image_url} 
                                  alt={item.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                              <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">{item.title}</h4>
                                  <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {item.icon}
                                  </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        onDelete={(id) => deleteItem('company_values', id)}
                        gridCols="grid-cols-1"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sectors">
                  <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
                    <div className="space-y-6">
                      <Card className="p-6">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                          <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-gray-900">Setores</h2>
                            <p className="text-sm text-gray-500">Adicione os setores em que sua empresa atua</p>
                          </div>
                        </div>

                        <SectorForm
                          form={sectorForm}
                          onSubmit={saveSector}
                          saving={saving}
                          handleImageChange={handleImageChange}
                        />
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold text-gray-900">Setores Cadastrados</h2>
                          <p className="text-sm text-gray-500">Gerencie os setores existentes</p>
                        </div>
                      </div>

                      <ContentList
                        items={sectors || []}
                        renderItem={(item) => (
                          <div className="group relative">
                            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                              <div className="relative aspect-square w-full overflow-hidden">
                                <img 
                                  src={item.image_url} 
                                  alt={item.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                              <div className="p-4">
                                <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">{item.title}</h4>
                              </div>
                            </div>
                          </div>
                        )}
                        onDelete={(id) => deleteItem('company_sectors', id)}
                        gridCols="grid-cols-1"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="certifications">
                  <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
                    <div className="space-y-6">
                      <Card className="p-6">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                          <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-gray-900">Certificações</h2>
                            <p className="text-sm text-gray-500">Adicione as certificações da sua empresa</p>
                          </div>
                        </div>

                        <CertificationForm
                          form={certificationForm}
                          onSubmit={saveCertification}
                          saving={saving}
                          handleImageChange={handleImageChange}
                        />
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold text-gray-900">Certificações Cadastradas</h2>
                          <p className="text-sm text-gray-500">Gerencie as certificações existentes</p>
                        </div>
                      </div>

                      <ContentList
                        items={certifications || []}
                        renderItem={(item) => (
                          <div className="group relative">
                            <div className="overflow-hidden rounded-lg bg-white border border-gray-200 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                              <div className="relative aspect-[3/2] w-full overflow-hidden p-6">
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                                />
                              </div>
                              <div className="p-4 text-center border-t border-gray-100">
                                <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">{item.name}</h4>
                              </div>
                            </div>
                          </div>
                        )}
                        onDelete={(id) => deleteItem('company_certifications', id)}
                        gridCols="grid-cols-1"
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CompanyEdit;
