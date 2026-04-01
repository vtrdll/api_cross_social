import { Link, useLocation } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const Header = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  if (!profile) return null;
  
  const initials = profile.username
  ? profile.username.substring(0, 2).toUpperCase()
  : "US";
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-2xl items-center justify-between px-4 lg:max-w-4xl">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">WOD</span>
            <span className="text-foreground">Social</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="h-9 w-64 rounded-lg bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Search className="h-5 w-5 text-foreground" />
          </button>

          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2">
            {profile.photo ? (
              <img src={profile.photo} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full gradient-fire flex items-center justify-center text-xs font-bold text-primary-foreground">
                {initials}
              </div>
            )}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-4 top-12 z-50 w-48 rounded-lg border border-border bg-card p-2 shadow-card animate-scale-in">
                <Link to="/profile/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors">
                  Meu Perfil
                </Link>
                <Link to="/profile/update/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors">
                  Configurações
                </Link>
                <Link to="/settings/privacy" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors">
                  Privacidade
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary transition-colors">
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="absolute top-14 left-0 right-0 border-b border-border bg-background p-3 md:hidden animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar atletas, boxes..." autoFocus className="h-10 w-full rounded-lg bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
      )}
      
    </header>
  );
};

export default Header;
