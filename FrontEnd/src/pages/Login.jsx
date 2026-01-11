import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await loginUser(username, password);
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('username', username);
            navigate('/chat');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-background-dark min-h-screen flex flex-col text-zinc-100 antialiased selection:bg-primary selection:text-white">
            <header className="w-full px-8 py-6 flex items-center justify-between absolute top-0 left-0">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                    </div>
                    <h2 className="text-base font-semibold tracking-wide text-white">TechSupport AI</h2>
                </div>
                <a className="hidden sm:flex text-sm font-medium text-zinc-500 hover:text-white transition-colors" href="#">
                    Contact Support
                </a>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 min-h-screen">
                <div className="w-full max-w-[420px] animate-fade-in-up">
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 md:p-10 shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
                            <p className="text-zinc-400 text-sm">Enter your credentials to access your account.</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider" htmlFor="username">Username</label>
                                <input
                                    className="w-full bg-transparent border border-border-dark rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    id="username"
                                    name="username"
                                    placeholder="johndoe"
                                    required
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-baseline">
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider" htmlFor="password">Password</label>
                                    <a href="#" className="text-[10px] text-primary hover:text-primary-hover uppercase tracking-wider font-semibold transition-colors">Forgot Password?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        className="w-full bg-transparent border border-border-dark rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-10"
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {error}
                                </div>
                            )}

                            <button
                                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg py-3 text-sm transition-colors mt-6 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border-dark"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="bg-surface-dark px-3 text-zinc-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border-dark rounded-lg hover:bg-zinc-800 transition-colors text-zinc-300 text-sm font-medium">
                                <img alt="Google Logo" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6DJ2zEdo6xGztlbM2NozmEVlBj0RQPx2RDx1uHjQAeb8Gf3jP2I1kZi6EZlDkc6JEkSZMrwu9v0YR1mFf78NDj8mBCC7_7GSGag7QUhR158O_yW6RP4bqzpyFs0bP-RczdkjE6SHJ3cUhubudTZ9257Wr_yb4O3yQikDTrE8o3I3alcMRgAvxQ8WQFkj5C0dQcijProyhq08pptr3BNXc_TkAbIICVXcs1DMzK2dIu9LYg62Gpin7-1lClDW6_tZTR2LADU1Chg" />
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border-dark rounded-lg hover:bg-zinc-800 transition-colors text-zinc-300 text-sm font-medium">
                                <img alt="GitHub Logo" className="w-4 h-4 invert opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwbW0xoOnJL1gVUw0ZwNm_EBfi7zxSU3Y2W8Re-rWjwTHCScpaTc5JeoRhPQe8ZH3yhzjOKnn8frzUDYaLTrRIT7UT1W3Kc1sEyEcR2vFlX1vaVG2LutZ6sap1R30M4IbAmaHnWpHQyHkkduV0rsnQwZHCW6CeptJEjJSZfp7DVNW_1ON6Nlx5FrPE-YRzVvuuSJEGJpjv9mC117sxcpsnn8CW6gVnlbOAjVATLAGwohYpj9cckD6WOCbNKe4hRFDVO89m0ubxHA" />
                                GitHub
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-zinc-500">
                        New user?
                        <Link className="text-primary hover:text-primary-hover font-medium transition-colors ml-1" to="/signup">
                            Create an account
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Login;
