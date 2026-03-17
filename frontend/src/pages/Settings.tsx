import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowLeft, User, Lock, Shield, Camera, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

const Settings = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [savingPhoto, setSavingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSavingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      await api.patch('/users/me/photo/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshProfile();
      toast({ title: 'Foto atualizada!' });
    } catch {
      toast({ title: 'Erro ao atualizar foto', variant: 'destructive' });
    } finally {
      setSavingPhoto(false);
    }
  };

  if (!profile) return null;

  const initials = `${(profile.user.first_name || 'U')[0]}${(profile.user.last_name || '')[0] || ''}`.toUpperCase();

  const menuItems = [
    { label: 'Editar Perfil', icon: User, path: '/settings/profile', color: 'text-primary' },
    { label: 'Alterar Senha', icon: Lock, path: '/settings/password', color: 'text-primary' },
    { label: 'Privacidade', icon: Shield, path: '/settings/privacy', color: 'text-primary' },
    { label: 'Deletar Conta', icon: Trash2, path: '/settings/delete-account', color: 'text-destructive' },
  ];

  return (
    <AppLayout>
      <div className="p-4 animate-fade-in max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Configurações</h1>
        </div>

        {/* Avatar section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {profile.photo ? (
              <img src={profile.photo} alt="avatar" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="h-24 w-24 rounded-full gradient-fire flex items-center justify-center text-3xl font-bold text-primary-foreground">
                {initials}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-1.5 rounded-full gradient-fire cursor-pointer hover:opacity-90 transition-opacity">
              <Camera className="h-4 w-4 text-primary-foreground" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {savingPhoto ? 'Enviando...' : profile.user.first_name + ' ' + profile.user.last_name}
          </p>
        </div>

        {/* Menu items */}
        <div className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between rounded-lg bg-secondary px-4 py-3.5 transition-colors hover:bg-muted group"
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className={`text-sm font-medium ${item.color === 'text-destructive' ? 'text-destructive' : 'text-foreground'}`}>
                  {item.label}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
