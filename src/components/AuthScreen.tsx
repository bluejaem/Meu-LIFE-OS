import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStore } from '@/store/useStore';
import { Lock, User, UserPlus, LogIn, ArrowRight } from 'lucide-react';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, register } = useAuthStore();
  const { updateSettings } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || (!isLogin && !name)) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (isLogin) {
      const res = login(username, password);
      if (!res.success) {
        setError(res.error || 'Erro ao fazer login.');
      } else if (res.user) {
        updateSettings({ userName: res.user.name, avatarUrl: res.user.avatarUrl || '' });
      }
    } else {
      const res = register({ name, username, passwordHash: password, avatarUrl: '' });
      if (!res.success) {
        setError(res.error || 'Erro ao cadastrar.');
      } else if (res.user) {
        updateSettings({ userName: res.user.name, avatarUrl: res.user.avatarUrl || '' });
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-navy-bg z-50 text-slate-200 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/10" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=3028&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
      
      <div className="relative z-10 w-full max-w-sm glass-panel p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            {isLogin ? <Lock size={28} className="text-white" /> : <UserPlus size={28} className="text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}</h1>
          <p className="text-sm text-slate-400 mt-2">
            {isLogin ? 'Faça login para acessar seu LIFE OS.' : 'Registre-se para começar a usar o LIFE OS.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-slate-500" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="João Guilherme"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Nome de Usuário</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 font-bold text-lg leading-none">@</span>
              </div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="joao_gui"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">{error}</div>}

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {isLogin ? (
              <><LogIn size={18} /> Entrar</>
            ) : (
              <>Criar Conta <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Registre-se.' : 'Já tem uma conta? Faça login.'}
          </button>
        </div>
      </div>
    </div>
  );
}
