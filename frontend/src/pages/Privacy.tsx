import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';
interface PrivacySettings {
  view_weight: boolean;
  view_height: boolean;
  view_category: boolean;
  view_box: boolean;
  view_personal_record: boolean;
}
const privacyLabels: Record<keyof PrivacySettings, string> = {
  view_weight: 'Exibir peso',
  view_height: 'Exibir altura',
  view_category: 'Exibir categoria',
  view_box: 'Exibir box',
  view_personal_record: 'Exibir recordes pessoais',
};
const Privacy = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PrivacySettings>({
    view_weight: true,
    view_height: true,
    view_category: true,
    view_box: true,
    view_personal_record: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.get('/privacy_list/').then(({ data }) => {
      console.log("Resposta da API:", data);
      setSettings({
        view_weight: data.view_weight,
        view_height: data.view_height,
        view_category: data.view_category,
        view_box: data.view_box,
        view_personal_record: data.view_personal_record,
      });
    }).catch(() => {
      toast({ title: 'Erro ao carregar configurações de privacidade', variant: 'destructive' });
    }).finally(() => setLoading(false));
  }, []);
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/privacy/', settings);
      toast({ title: 'Privacidade atualizada!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };
  const toggle = (key: keyof PrivacySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <AppLayout>
      <div className="p-4 animate-fade-in max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Privacidade</h1>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Escolha quais informações ficam visíveis no seu perfil</span>
            </div>
            {(Object.keys(privacyLabels) as (keyof PrivacySettings)[]).map(key => (
              <button
                key={key}
                onClick={() => toggle(key)}
                className="w-full flex items-center justify-between rounded-lg bg-secondary px-4 py-3.5 transition-colors hover:bg-muted"
              >
                <span className="text-sm font-medium text-foreground">{privacyLabels[key]}</span>
                <div className={`relative h-6 w-11 rounded-full transition-colors ${settings[key] ? 'bg-primary' : 'bg-border'}`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </button>
            ))}
            <button
  onClick={handleSave}
  disabled={saving}
  className="w-full rounded-lg gradient-fire py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
>
  <Save className="h-4 w-4" />
  {saving ? 'Salvando...' : 'Salvar Privacidade'}
</button>

<button
  onClick={() => navigate('/settings/password')}
  className="w-full rounded-lg border border-border py-3 text-sm font-semibold text-foreground flex items-center justify-center gap-2 hover:bg-muted transition-colors"
>
  <Shield className="h-4 w-4" />
  Alterar senha
</button>

<button
  onClick={() => navigate('/settings/password')}
  className="w-full rounded-lg border border-border py-3 text-sm font-semibold text-foreground flex items-center justify-center gap-2 hover:bg-muted transition-colors"
>
  <Shield className="h-4 w-4" />
  Deletar Conta
</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
export default Privacy;