import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import WodCard from '@/components/social/WodCard';
import { useWods } from '@/hooks/useWods';
import { useAuth } from '@/context/AuthContext';
import type { Wod as WodType, LeaderboardEntry } from '@/types';
import { Dumbbell, Plus, X, Filter, Trophy, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type View = 'list' | 'create' | 'edit' | 'leaderboard' | 'submit';

const WOD_TYPES = [
  { value: 'FOR_TIME', label: 'For Time' },
  { value: 'AMRAP', label: 'AMRAP' },
  { value: 'EMOM', label: 'EMOM' },
];

const Wod = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    wods, pinnedWod, todayWod, isLoading,
    toggleLike, createWod, updateWod, deleteWod, pinWod,
    submitResult, submitForTime, submitAmrap, submitEmom,
    fetchLeaderboard, refetch,
  } = useWods();

  const isCoach = profile?.is_coach ?? false;

  const [view, setView] = useState<View>('list');
  const [filterType, setFilterType] = useState<string>('');
  const [editingWod, setEditingWod] = useState<WodType | null>(null);
  const [selectedWod, setSelectedWod] = useState<WodType | null>(null);

  // Form state
  const [form, setForm] = useState({ title: '', description_wod: '', type: 'FOR_TIME', pinned: false, time_cap: '', rounds: '' });
  const [submitting, setSubmitting] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  // Result form
  const [resultForm, setResultForm] = useState({ completed: true, notes: '', minutes: '', seconds: '', rounds: '', reps: '', roundsCompleted: '', failedMinute: '' });

  const inputClass = "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  const resetForm = () => setForm({ title: '', description_wod: '', type: 'FOR_TIME', pinned: false, time_cap: '', rounds: '' });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await createWod({
        title: form.title,
        description_wod: form.description_wod,
        type: form.type,
        pinned: form.pinned,
        time_cap: form.time_cap ? Number(form.time_cap) : undefined,
        rounds: form.rounds ? Number(form.rounds) : undefined,
      });
      resetForm();
      setView('list');
      toast({ title: 'WOD criado!' });
    } catch {
      toast({ title: 'Erro ao criar WOD', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingWod) return;
    setSubmitting(true);
    try {
      await updateWod(editingWod.id, {
        title: form.title,
        description_wod: form.description_wod,
        type: form.type as WodType['type'],
        pinned: form.pinned,
        time_cap: form.time_cap ? Number(form.time_cap) : undefined,
        rounds: form.rounds ? Number(form.rounds) : undefined,
      });
      resetForm();
      setEditingWod(null);
      setView('list');
      toast({ title: 'WOD atualizado!' });
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deletar este WOD?')) return;
    try {
      await deleteWod(id);
      toast({ title: 'WOD deletado' });
    } catch {
      toast({ title: 'Erro ao deletar', variant: 'destructive' });
    }
  };

  const openEdit = (wod: WodType) => {
    setEditingWod(wod);
    setForm({
      title: wod.title,
      description_wod: wod.description_wod,
      type: wod.type,
      pinned: wod.pinned,
      time_cap: wod.time_cap?.toString() || '',
      rounds: wod.rounds?.toString() || '',
    });
    setView('edit');
  };

  const openLeaderboard = async (wod: WodType) => {
    setSelectedWod(wod);
    setView('leaderboard');
    setLbLoading(true);
    try {
      const lb = await fetchLeaderboard(wod.id);
      setLeaderboard(lb);
    } catch {
      setLeaderboard([]);
    } finally {
      setLbLoading(false);
    }
  };

  const openSubmitResult = (wod: WodType) => {
    setSelectedWod(wod);
    setResultForm({ completed: true, notes: '', minutes: '', seconds: '', rounds: '', reps: '', roundsCompleted: '', failedMinute: '' });
    setView('submit');
  };

  const handleSubmitResult = async () => {
    if (!selectedWod) return;
    setSubmitting(true);
    try {
      const result = await submitResult({ wod: selectedWod.id, completed: resultForm.completed, notes: resultForm.notes || undefined });
      if (selectedWod.type === 'FOR_TIME' && resultForm.minutes) {
        const totalSec = (Number(resultForm.minutes) * 60) + Number(resultForm.seconds || 0);
        await submitForTime(result.id, totalSec);
      } else if (selectedWod.type === 'AMRAP') {
        await submitAmrap(result.id, Number(resultForm.rounds || 0), Number(resultForm.reps || 0));
      } else if (selectedWod.type === 'EMOM') {
        await submitEmom(result.id, Number(resultForm.roundsCompleted || 0), resultForm.failedMinute ? Number(resultForm.failedMinute) : undefined);
      }
      toast({ title: 'Resultado registrado!' });
      setView('list');
    } catch {
      toast({ title: 'Erro ao registrar resultado', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWods = filterType ? wods.filter(w => w.type === filterType) : wods;

  const goBack = () => { setView('list'); setEditingWod(null); setSelectedWod(null); };

  // ========== FORM VIEW (create/edit) ==========
  if (view === 'create' || view === 'edit') {
    return (
      <AppLayout>
        <div className="animate-fade-in">
          <div className="px-4 pt-4 pb-2 flex items-center gap-3">
            <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></button>
            <h1 className="text-lg font-bold text-foreground">{view === 'create' ? 'Criar WOD' : 'Editar WOD'}</h1>
          </div>
          <div className="mx-4 mb-4 space-y-3">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título do WOD" className={inputClass} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputClass}>
              {WOD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <textarea value={form.description_wod} onChange={e => setForm(f => ({ ...f, description_wod: e.target.value }))} placeholder="Descrição do treino..." rows={6} className={`${inputClass} resize-none`} />
            {(form.type === 'FOR_TIME' || form.type === 'AMRAP' || form.type === 'EMOM') && (
              <input value={form.time_cap} onChange={e => setForm(f => ({ ...f, time_cap: e.target.value }))} placeholder="Time Cap (minutos)" type="number" className={inputClass} />
            )}
            {(form.type === 'AMRAP' || form.type === 'EMOM') && (
              <input value={form.rounds} onChange={e => setForm(f => ({ ...f, rounds: e.target.value }))} placeholder="Rounds" type="number" className={inputClass} />
            )}
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} className="accent-primary" />
              Fixar no topo do feed
            </label>
            <button
              onClick={view === 'create' ? handleCreate : handleUpdate}
              disabled={submitting || !form.title.trim()}
              className="w-full rounded-lg gradient-fire py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : view === 'create' ? 'Criar WOD' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ========== LEADERBOARD VIEW ==========
  if (view === 'leaderboard' && selectedWod) {
    return (
      <AppLayout>
        <div className="animate-fade-in">
          <div className="px-4 pt-4 pb-2 flex items-center gap-3">
            <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></button>
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /> Ranking</h1>
              <p className="text-sm text-muted-foreground">{selectedWod.title}</p>
            </div>
          </div>
          {lbLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
          ) : leaderboard.length > 0 ? (
            <div className="mx-4 space-y-2 pb-20">
              {leaderboard.map((entry, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border border-border bg-card ${idx < 3 ? 'border-primary/30' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : idx === 1 ? 'bg-gray-400/20 text-gray-300' : idx === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                    {entry.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">@{entry.username}</p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                  <div className="text-right">
                    {entry.time_formatted && <p className="text-sm font-bold text-primary">{entry.time_formatted}</p>}
                    {entry.result_formatted && <p className="text-sm font-bold text-primary">{entry.result_formatted}</p>}
                    {entry.rounds_completed !== undefined && !entry.result_formatted && (
                      <p className="text-sm font-bold text-primary">{entry.rounds_completed} rounds</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Nenhum resultado registrado</p>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // ========== SUBMIT RESULT VIEW ==========
  if (view === 'submit' && selectedWod) {
    return (
      <AppLayout>
        <div className="animate-fade-in">
          <div className="px-4 pt-4 pb-2 flex items-center gap-3">
            <button onClick={goBack} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="h-5 w-5" /></button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Registrar resultado</h1>
              <p className="text-sm text-muted-foreground">{selectedWod.title} · {selectedWod.type}</p>
            </div>
          </div>
          <div className="mx-4 mb-4 space-y-3">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={resultForm.completed} onChange={e => setResultForm(f => ({ ...f, completed: e.target.checked }))} className="accent-primary" />
              Completei o WOD
            </label>

            {selectedWod.type === 'FOR_TIME' && (
              <div className="flex gap-2">
                <input value={resultForm.minutes} onChange={e => setResultForm(f => ({ ...f, minutes: e.target.value }))} placeholder="Minutos" type="number" className={inputClass} />
                <input value={resultForm.seconds} onChange={e => setResultForm(f => ({ ...f, seconds: e.target.value }))} placeholder="Segundos" type="number" className={inputClass} />
              </div>
            )}

            {selectedWod.type === 'AMRAP' && (
              <div className="flex gap-2">
                <input value={resultForm.rounds} onChange={e => setResultForm(f => ({ ...f, rounds: e.target.value }))} placeholder="Rounds" type="number" className={inputClass} />
                <input value={resultForm.reps} onChange={e => setResultForm(f => ({ ...f, reps: e.target.value }))} placeholder="Reps extras" type="number" className={inputClass} />
              </div>
            )}

            {selectedWod.type === 'EMOM' && (
              <div className="flex gap-2">
                <input value={resultForm.roundsCompleted} onChange={e => setResultForm(f => ({ ...f, roundsCompleted: e.target.value }))} placeholder="Rounds completos" type="number" className={inputClass} />
                <input value={resultForm.failedMinute} onChange={e => setResultForm(f => ({ ...f, failedMinute: e.target.value }))} placeholder="Minuto falha (opcional)" type="number" className={inputClass} />
              </div>
            )}

            <textarea value={resultForm.notes} onChange={e => setResultForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observações (opcional)" rows={3} className={`${inputClass} resize-none`} />

            <button onClick={handleSubmitResult} disabled={submitting} className="w-full rounded-lg gradient-fire py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {submitting ? 'Enviando...' : 'Enviar resultado'}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ========== LIST VIEW ==========
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
          {isCoach && (
            <button onClick={() => { resetForm(); setView('create'); }} className="rounded-lg gradient-fire p-2 text-primary-foreground hover:opacity-90">
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          <button onClick={() => setFilterType('')} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${!filterType ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
            Todos
          </button>
          {WOD_TYPES.map(t => (
            <button key={t.value} onClick={() => setFilterType(t.value)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${filterType === t.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Pinned / Today */}
        {pinnedWod && !filterType && (
          <div className="mx-4 mb-2 p-3 rounded-xl border border-primary/40 bg-primary/5">
            <p className="text-xs font-bold text-primary mb-1">📌 WOD FIXADO</p>
            <p className="text-sm font-semibold text-foreground">{pinnedWod.title}</p>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans mt-1 line-clamp-3">{pinnedWod.description_wod}</pre>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando WODs...</div>
        ) : filteredWods.length > 0 ? (
          <div className="pb-20">
            {filteredWods.map(wod => (
              <WodCard
                key={wod.id}
                wod={wod}
                isCoach={isCoach}
                onLike={toggleLike}
                onPin={pinWod}
                onEdit={openEdit}
                onDelete={handleDelete}
                onViewLeaderboard={openLeaderboard}
                onSubmitResult={openSubmitResult}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground">Nenhum WOD</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filterType ? 'Nenhum WOD deste tipo encontrado.' : 'Os coaches ainda não publicaram treinos.'}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Wod;
