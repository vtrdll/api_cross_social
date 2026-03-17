import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import WodCard from '@/components/social/WodCard';
import { useWods } from '@/hooks/useWods';
import { useAuth } from '@/context/AuthContext';
import { Dumbbell, Plus } from 'lucide-react';

const Wod = () => {
  const { profile } = useAuth();
  const { wods, isLoading, toggleLike, createWod } = useWods();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description_wod: '', pinned: false });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await createWod(form);
      setForm({ title: '', description_wod: '', pinned: false });
      setShowForm(false);
    } catch {
      // error handling
    } finally {
      setSubmitting(false);
    }
  };
  console.log("is_coach direto:", profile?.is_coach);
  console.log('Dados enviados:', form);
  const inputClass = "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" /> WOD
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Treinos publicados pelos coaches</p>
          </div>
          {profile?.is_coach && (
            <button onClick={() => setShowForm(!showForm)} className="rounded-lg gradient-fire p-2 text-primary-foreground hover:opacity-90">
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {showForm && profile?.is_coach && (
          <div className="mx-4 mb-4 p-4 rounded-xl border border-border bg-card space-y-3 animate-slide-up">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título do WOD" className={inputClass} />
            <textarea value={form.description_wod} onChange={e => setForm(f => ({ ...f, description_wod: e.target.value }))} placeholder="Descrição do treino..." rows={5} className={`${inputClass} resize-none`} />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} className="accent-primary" />
              Fixar no topo do feed
            </label>
            <button onClick={handleCreate} disabled={submitting} className="w-full rounded-lg gradient-fire py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {submitting ? 'Criando...' : 'Criar WOD'}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando WODs...</div>
        ) : wods.length > 0 ? (
          wods.map(wod => <WodCard key={wod.id} wod={wod} onLike={toggleLike} />)
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-foreground">Nenhum WOD</p>
            <p className="text-sm text-muted-foreground mt-1">Os coaches ainda não publicaram treinos.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Wod;
