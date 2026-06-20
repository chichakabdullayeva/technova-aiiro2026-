import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await signup({ email, password, name });
        setMode('login');
      }
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-900">
      <div className="card w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Shield className="text-cyber-400 mb-3" size={48} />
          <h1 className="text-2xl font-bold">Kiber-DNT</h1>
          <p className="text-gray-500 text-sm mt-1">Avtonom Kiber Müdafiə Platformu</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input className="input" placeholder="Ad" value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Şifrə" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn btn-primary w-full">{mode === 'login' ? 'Daxil ol' : 'Qeydiyyat'}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? (
            <>Hesabınız yoxdur? <button className="text-cyber-400 hover:underline" onClick={() => setMode('signup')}>Qeydiyyat</button></>
          ) : (
            <>Artıq hesabınız var? <button className="text-cyber-400 hover:underline" onClick={() => setMode('login')}>Daxil ol</button></>
          )}
        </p>
        <p className="text-center text-xs text-gray-600 mt-4">
          Demo: admin@kiberdnt.az / admin (və ya analyst@kiberdnt.az / admin)
        </p>
      </div>
    </div>
  );
}
