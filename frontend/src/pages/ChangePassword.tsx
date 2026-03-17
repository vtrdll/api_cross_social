import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState({ new_password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const inputClass =
    'w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors';

  const handleSubmit = async () => {
    if (password.new_password !== password.confirm) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }
    if (password.new_password.length < 6) {
      toast({ title: 'A senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await api.patch('/profile/update/password/', { password: password.new_password });
      setPassword({ new_password: '', confirm: '' });
      toast({ title: 'Senha alterada com sucesso!' });
    } catch {
      toast({ title: 'Erro ao alterar senha', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 animate-fade-in max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Alterar Senha</h1>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nova Senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password.new_password}
              onChange={e => setPassword(p => ({ ...p, new_password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              className={inputClass}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-7 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirmar Senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password.confirm}
              onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))}
              placeholder="Repita a nova senha"
              className={inputClass}
            />
          </div>

          <button onClick={handleSubmit} disabled={saving || !password.new_password}
            className="w-full rounded-lg gradient-fire py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> {saving ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChangePassword;
