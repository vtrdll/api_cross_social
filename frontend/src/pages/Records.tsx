import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { Trophy, Plus, Trash2, Edit, X, Check } from 'lucide-react';
import { useMoviments } from '@/hooks/useMoviments';


const Records = () => {
  const { records, isLoading, createRecord, updateRecord, deleteRecord } = usePersonalRecords();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ moviment: 0, personal_record: '', date: '' });
  const [submitting, setSubmitting] = useState(false);
  const { moviments } = useMoviments();

  const inputClass = "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";
 

  const handleSubmit = async () => {
  if (!form.moviment || !form.personal_record) return;

  setSubmitting(true);

  try {

    const payload = {
      moviment: Number(form.moviment), // ← conversão aqui
      personal_record: form.personal_record,
      date: form.date
    };

    if (editId) {
      await updateRecord(editId, payload);
      setEditId(null);
    } else {
      await createRecord(payload);
    }

    setForm({ moviment: 0, personal_record: '', date: '' });
    setShowForm(false);

  } finally {
    setSubmitting(false);
  }
};
  
  const startEdit = (pr: typeof records[0]) => {
  setForm({
    moviment: pr.moviment, // ✅ ID correto
    personal_record: pr.personal_record,
    date: pr.date
  });

  setEditId(pr.id);
  setShowForm(true);
};
  
  return (
    <AppLayout>
      <div className="p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Personal Records
          </h1>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ moviment: 0, personal_record: '', date: '' }); }} className="rounded-lg gradient-fire p-2 text-primary-foreground hover:opacity-90">
            <Plus className="h-5 w-5" />
          </button>
        </div>

       {showForm && (
          <div className="mb-4 p-4 rounded-xl border border-border bg-card space-y-3 animate-slide-up">
            <select
                value={form.moviment}
                onChange={(e) =>
                  setForm({
                    ...form,
                    moviment: Number(e.target.value)
                  })
                }
                className={inputClass}
              >
              <option value={0}>Selecione um movimento</option>

                  {moviments.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
  ))}
</select>
            <input value={form.personal_record} onChange={e => setForm(f => ({ ...f, personal_record: e.target.value }))} placeholder="Recorde (ex: 100kg, 3:42)" className={inputClass} />
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass} />
            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-lg gradient-fire py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> {editId ? 'Atualizar' : 'Salvar'}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando PRs...</div>
        ) : records.length > 0 ? (
          <div className="space-y-3">
            {records.map((pr) => (
              <div key={pr.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-foreground">{pr.name_moviment}</p>
                  <p className="text-xs text-muted-foreground">{pr.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-primary">{pr.personal_record}</p>
                  <button onClick={() => startEdit(pr)} className="text-muted-foreground hover:text-foreground">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteRecord(pr.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-foreground">Nenhum PR</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione seu primeiro recorde pessoal!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Records;
