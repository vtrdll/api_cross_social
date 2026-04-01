import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useTeams } from '@/hooks/useTeams';
import AppLayout from '@/components/layout/AppLayout';
import { Settings, Grid3X3, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { C } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';

const Profile = () => {
  const { profile } = useAuth();
  const { posts, isLoading: postsLoading } = usePosts('me');
  const { records, isLoading: prsLoading } = usePersonalRecords();
  const { teams } = useTeams('me');
  const [activeTab, setActiveTab] = useState<'posts' | 'prs' | 'teams'>('posts');

  if (!profile) return null;

  const initials = `${(profile.username || 'U')[0]}${(profile.first_name || '')[0] || ''}`.toUpperCase();
  console.log(profile)
  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Profile header */}
        <div className="px-4 py-6">
          <div className="flex items-center gap-6">
            {profile.photo ? (
              <img src={profile.photo} alt="avatar" className="h-20 w-20 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="h-20 w-20 rounded-full gradient-fire flex items-center justify-center text-2xl font-bold text-primary-foreground flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{profile.username}</h1>
                {profile.is_coach && (
                  <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">Coach</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
              {profile.view_box && profile.box && <p className="text-xs text-primary mt-1">📍 {profile.box_name}</p>}
              {profile.view_weight && profile.weight && <p className="text-xs text-muted-foreground">{profile.weight} kg</p>}
              {profile.view_height && profile.height && <p className="text-xs text-muted-foreground">{profile.height} cm</p>}

              {profile.view_category && profile.category && <p className="text-xs text-muted-foreground">Categoria: {profile.category}</p>}

              
            </div>
          </div>

          <div className="flex justify-around mt-6 py-3 border-y border-border">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{profile.posts_count}</p>
              <p className="text-xs text-muted-foreground">posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{profile.followers_count}</p>
              <p className="text-xs text-muted-foreground">se</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{profile.following_count}</p>
              <p className="text-xs text-muted-foreground">se</p>
            </div>
          </div>

          <button className="mt-4 w-full rounded-lg border border-border bg-secondary py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
            <Settings className="h-4 w-4" /> Editar Perfil
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'posts' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}>
            <Grid3X3 className="h-4 w-4" /> Posts
          </button>
          <button onClick={() => setActiveTab('prs')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'prs' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}>
            <Trophy className="h-4 w-4" /> PRs
          </button>
          <button onClick={() => setActiveTab('teams')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'teams' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}>
            <Users className="h-4 w-4" /> Times
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          postsLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando posts...</div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-[2px]">
              {posts.map((post) => (
                <div key={post.id} 
                className="aspect-square bg-secondary flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer overflow-hidden">
                  
                  {post.imagens[0] ? (
                    <img
                        src={`http://127.0.0.1:8000${post.imagens[0]}`}
                        className="h-full w-full object-cover"
                      />
                  ) : (
                    <span className="text-2xl">🏋️</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center pZy-12 text-muted-foreground text-sm">Nenhum post ainda</div>
          )
        )}

        {activeTab === 'prs' && (
  prsLoading ? (
    <div className="p-8 text-center text-muted-foreground">
      Carregando PRs...
    </div>
  ) : !profile.view_personal_record ? (
    <div className="text-center py-12 text-muted-foreground text-sm">
      O usuário preferiu manter os PRs privados
    </div>
  ) : records.length > 0 ? (
    <div className="p-4 space-y-3">
      {records.map((pr) => (
        <div
          key={pr.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">
              {pr.name_moviment}
            </p>
            <p className="text-xs text-muted-foreground">{pr.date}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {pr.personal_record}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-12 text-muted-foreground text-sm">
      Nenhum PR cadastrado
    </div>
  )
)}

        {activeTab === 'teams' && (
          teams.length > 0 ? (
            <div className="p-4 space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                  <h3 className="text-sm font-bold text-foreground">{team.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{team.description}</p>
                  <p className="text-xs text-primary mt-1">{team.box} · {team.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">{team.members.length} membros</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">Não participa de nenhum time</div>
          )
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
