import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Dumbbell, Calendar, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/wod', icon: Dumbbell, label: 'WOD' },
  { to: '/create', icon: PlusSquare, label: 'Criar' },
  { to: '/events', icon: Calendar, label: 'Eventos' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center justify-around">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          const isCreate = to === '/create';
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isCreate
                  ? 'text-primary'
                  : isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-6 w-6 ${isCreate ? 'text-primary' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
