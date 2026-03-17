import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';

const DeleteAccount = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const inputClass =
    'w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-destructive focus:ring-1 focus:ring-destructive transition-colors';

  const canDelete = confirmText === 'DELETAR';

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await api.delete('/delete_account/');
      logout();
      toast({ title: 'Conta deletada com sucesso' });
      navigate('/login', { replace: true });
    } catch {
      toast({ title: 'Erro ao deletar conta', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 animate-fade-in max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-destructive">Deletar Conta</h1>
        </div>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-destructive">Ação irreversível</p>
              <p className="text-sm text-muted-foreground">
                Ao deletar sua conta, todos os seus dados serão permanentemente removidos, incluindo posts, recordes, times e informações de perfil.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Digite <span className="font-bold text-destructive">DELETAR</span> para confirmar
            </label>
            <input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETAR"
              className={inputClass}
            />
          </div>

          <button onClick={handleDelete} disabled={!canDelete || deleting}
            className="w-full rounded-lg bg-destructive py-3 text-sm font-semibold text-destructive-foreground disabled:opacity-50 flex items-center justify-center gap-2 transition-colors hover:bg-destructive/90">
            <Trash2 className="h-4 w-4" /> {deleting ? 'Deletando...' : 'Deletar Minha Conta'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default DeleteAccount;
