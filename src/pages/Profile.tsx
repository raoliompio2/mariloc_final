import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Upload, Save, Loader, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from '../components/AdminPageHeader';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  cpf_cnpj: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  avatar_url: string | null;
  role: 'client' | 'landlord';
}

interface SecurityForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [success, setSuccess] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityForm, setSecurityForm] = useState<SecurityForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(profile);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSecurityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!profile) throw new Error('Perfil não encontrado');

      let avatarUrl = profile.avatar_url;

      if (avatar) {
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
          cpf_cnpj: profile.cpf_cnpj,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          postal_code: profile.postal_code,
          avatar_url: avatarUrl
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setSuccess('Perfil atualizado com sucesso!');
      loadProfile(); // Recarrega o perfil para mostrar as alterações
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSecurity(true);
    setSecurityError('');
    setSecuritySuccess('');

    try {
      // Validações
      if (securityForm.newPassword !== securityForm.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (securityForm.newPassword.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres');
      }

      // Verificar senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: securityForm.currentPassword
      });

      if (signInError) {
        throw new Error('Senha atual incorreta');
      }

      // Atualizar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: securityForm.newPassword
      });

      if (updateError) throw updateError;

      setSecuritySuccess('Senha atualizada com sucesso!');
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error updating security:', err);
      setSecurityError(err instanceof Error ? err.message : 'Erro ao atualizar senha');
    } finally {
      setSavingSecurity(false);
    }
  };

  const breadcrumbs = [
    { label: profile?.role === 'client' ? 'Painel do Cliente' : 'Painel Administrativo', 
      path: profile?.role === 'client' ? '/client-dashboard' : '/landlord-dashboard' },
    { label: 'Meu Perfil' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdminPageHeader
        title="Meu Perfil"
        breadcrumbs={breadcrumbs}
      />
      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-text mb-6">Informações Pessoais</h2>

              {/* Avatar */}
              <div className="mb-8 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : avatar ? (
                      <img
                        src={URL.createObjectURL(avatar)}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                        {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Upload className="h-4 w-4" />
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Clique no ícone para alterar sua foto
                </p>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile?.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile?.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    name="cpf_cnpj"
                    value={profile?.cpf_cnpj || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-text">
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text mb-2">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profile?.address || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={profile?.city || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={profile?.state || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={profile?.postal_code || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Security Form */}
            <form onSubmit={handleSecuritySubmit} className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-text">Segurança</h2>
              </div>

              {securityError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {securityError}
                </div>
              )}

              {securitySuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {securitySuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={securityForm.currentPassword}
                    onChange={handleSecurityInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={securityForm.newPassword}
                    onChange={handleSecurityInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={securityForm.confirmPassword}
                    onChange={handleSecurityInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSecurity}
                  className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {savingSecurity ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Atualizar Senha
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}