import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Dumbbell, Calendar, User, Trophy, Users } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Feed' },
  { to: '/wod', icon: Dumbbell, label: 'WOD' },
  { to: '/create', icon: PlusSquare, label: 'Criar Post' },
  { to: '/events', icon: Calendar, label: 'Eventos' },
  { to: '/profile', icon: User, label: 'Perfil' },
  { to: '/records', icon: Trophy, label: 'PRs' },
  { to: '/team', icon: Users, label: 'Time' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-56 flex-col border-r border-border bg-background p-4">
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
