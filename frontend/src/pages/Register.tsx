import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Dumbbell, ChevronLeft } from 'lucide-react';

const Register = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', first_name: '', last_name: '', email: '', password: '', password_confirm: '',
    box: '', weight: '', height: '', gender: '', date_of_birth: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password) {
      setError('Preencha os campos obrigatórios');
      return;
    }
    if (form.password !== form.password_confirm) {
      setError('As senhas não coincidem');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    try {
      await register(form);
      navigate('/');
    } catch {
      setError('Erro ao criar conta');
    }
  };

  const inputClass = "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 h-14 w-14 rounded-2xl gradient-fire flex items-center justify-center glow-primary">
            <Dumbbell className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Junte-se à comunidade</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.username} onChange={e => update('username', e.target.value)} placeholder="Username *" className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.first_name} onChange={e => update('first_name', e.target.value)} placeholder="Nome" className={inputClass} />
            <input value={form.last_name} onChange={e => update('last_name', e.target.value)} placeholder="Sobrenome" className={inputClass} />
          </div>
          <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Email *" className={inputClass} />
          <input value={form.box} onChange={e => update('box', e.target.value)} placeholder="Box (academia)" className={inputClass} />
          <input type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} className={inputClass} />
          <div className="grid grid-cols-3 gap-3">
            <input value={form.weight} onChange={e => update('weight', e.target.value)} placeholder="Peso (kg)" className={inputClass} />
            <input value={form.height} onChange={e => update('height', e.target.value)} placeholder="Altura (cm)" className={inputClass} />
            <select value={form.gender} onChange={e => update('gender', e.target.value)} className={inputClass}>
              <option value="">Gênero</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Senha *" className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <input type={showPassword ? 'text' : 'password'} value={form.password_confirm} onChange={e => update('password_confirm', e.target.value)} placeholder="Confirmar senha *" className={inputClass} />

          {error && <p className="text-sm text-destructive animate-slide-up">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full rounded-lg gradient-fire py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {isLoading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
