import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Dumbbell, ChevronLeft } from 'lucide-react';

const Register = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    photo: null,
    birthday: '',
    category: '',
    box: '',
    genre: '',
    weight: '',
    height: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password1) {
      setError('Preencha os campos obrigatórios');
      return;
    }
    if (form.password1 !== form.password2) {
      setError('As senhas não coincidem');
      return;
    }
    if (form.password1.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    // Monta o payload conforme solicitado
    // Ajusta birthday para DD/MM/YYYY e box para número
    let birthday = form.birthday;
    // Se vier em formato yyyy-mm-dd, converte para dd/mm/yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      const [y, m, d] = birthday.split('-');
      birthday = `${d}/${m}/${y}`;
    }
    const payload = { 
      ...form, 
      birthday: birthday,
      photo: form.photo || null,
      box: form.box ? Number(form.box) : null,
      weight: form.weight ? Number(form.weight) : null,
      height: form.height ? Number(form.height) : null,
    };
    try {
      await register(payload);
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
          
          <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Email *" className={inputClass} />
          <input value={form.box} onChange={e => update('box', e.target.value)} placeholder="Box (academia)" className={inputClass} />
          <select value={form.category} onChange={e => update('category', e.target.value)} className={inputClass}>
            <option value="">Categoria</option>
            <option value="FITNESS">FITNESS</option>
            <option value="SCALED">SCALED</option>
            <option value="AMADOR">AMADOR</option>
            <option value="RX">RX</option>
            <option value="MASTER">MASTER</option>
          </select>
          <input
  type="date"
  value={form.birthday}
  onChange={e => update('birthday', e.target.value)}
  className={inputClass}
/>
          <div className="grid grid-cols-3 gap-3">
            <input value={form.weight} onChange={e => update('weight', e.target.value)} placeholder="Peso (kg)" className={inputClass} />
            <input value={form.height} onChange={e => update('height', e.target.value)} placeholder="Altura (cm)" className={inputClass} />
            <select value={form.genre} onChange={e => update('genre', e.target.value)} className={inputClass}>
              <option value="">Gênero</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
            </select>
          </div>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={form.password1} onChange={e => update('password1', e.target.value)} placeholder="Senha *" className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <input type={showPassword ? 'text' : 'password'} value={form.password2} onChange={e => update('password2', e.target.value)} placeholder="Confirmar senha *" className={inputClass} />

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
