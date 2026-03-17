import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTeams } from '@/hooks/useTeams';
import { useBoxes } from "@/hooks/useBoxes";
import type { TeamForm } from "@/types";
import { useAuth } from '@/context/AuthContext';
import { Users, Plus, Trash2, UserPlus, X } from 'lucide-react';


const Teams = () => {
  const { boxes } = useBoxes();
  const { profile } = useAuth();
  const { teams, isLoading, createTeam, addMember, removeMember } = useTeams();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TeamForm>({
    name: "",
    description: "",
    box: "",
    category: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [addMemberTeamId, setAddMemberTeamId] = useState<number | null>(null);
  const [memberUserId, setMemberUserId] = useState('');

  const inputClass = "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  const handleCreate = async () => {
  if (!form.name.trim()) return;

  setSubmitting(true);

  try {
    await createTeam(form);

    setForm({
      name: "",
      description: "",
      box: "",
      category: "",
    });

  } finally {
    setSubmitting(false);
  }
};
  
  const handleAddMember = async (teamId: number) => {
    const userId = parseInt(memberUserId);
    if (!userId) return;
    await addMember(teamId, userId);
    setMemberUserId('');
    setAddMemberTeamId(null);
  };
  
  return (
    <AppLayout>
      <div className="p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Times
          </h1>
          <button onClick={() => setShowForm(!showForm)} className="rounded-lg gradient-fire p-2 text-primary-foreground hover:opacity-90">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        {showForm && 
        (
          <div className="mb-4 p-4 rounded-xl border border-border bg-card space-y-3 animate-slide-up">
            
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do time" className={inputClass} />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição" rows={3} className={`${inputClass} resize-none`} />
                      <select
  value={form.box}
  onChange={(e) =>
    setForm({
      ...form,
      box: e.target.value === "" ? "" : Number(e.target.value)
    })
  }
  className={inputClass}
>
  
  
  <option value="">Selecione um Box</option>

  {boxes.map(box => (
    <option key={box.id} value={box.id}>
      {box.box_name}
    </option>
  ))}
</select>

            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Categoria" className={inputClass} />
            <button onClick={handleCreate} disabled={submitting} className="w-full rounded-lg gradient-fire py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {submitting ? 'Criando...' : 'Criar Time'}
            </button>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando times...</div>
        ) : teams.length > 0 ? (
          <div className="space-y-4">
            {teams.map((team) => {
              const isCreator = profile?.id === team?.creator;
              return (
                <div key={team.id} className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{team.name}</h3>
                      <p className="text-xs text-primary">· {team.category}</p>
                    </div>
                    {isCreator && (
                      <button onClick={() => setAddMemberTeamId(addMemberTeamId === team.id ? null : team.id)} className="text-muted-foreground hover:text-primary">
                        <UserPlus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{team.description}</p>

                  {addMemberTeamId === team.id && (
                    <div className="mt-3 flex gap-2 animate-slide-up">
                      <input value={memberUserId} onChange={e => setMemberUserId(e.target.value)} placeholder="ID do usuário" className={`${inputClass} flex-1`} />
                      <button onClick={() => handleAddMember(team.id)} className="rounded-lg gradient-fire px-4 text-sm font-semibold text-primary-foreground">
                        Adicionar
                      </button>
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">{team.members.length} membros</p>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map(member => (
                        <div key={member.id} className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-foreground">
                          {member.username}
                          {isCreator && member.id !== team.creator.id && (
                            <button onClick={() => removeMember(team.id, member.id)} className="text-muted-foreground hover:text-destructive ml-1">
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-foreground">Nenhum time</p>
            <p className="text-sm text-muted-foreground mt-1">Crie ou participe de um time!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Teams;
