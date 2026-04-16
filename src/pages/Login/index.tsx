import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { createUserIfNotExists } from '@/entities/User';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const signInWithGoogle = async () => {
		setLoading(true);
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const credential = GoogleAuthProvider.credentialFromResult(result);
			const token = credential?.accessToken;

			const user = result.user;

			const userDetails = {
				id: user.uid,
				uui: user.uid,
				name: user.displayName,
				email: user.email,
				photoURL: user.photoURL,
				createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
			};
			await createUserIfNotExists(userDetails);
			localStorage.setItem('user_uid', user.uid);
			toast.success('Google login successful!');
			navigate('/dashboard');
			return { user, token };
		} catch (error: any) {
			console.error('Google login error:', error);
			setLoading(false);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-elevated animate-fade-in">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-light">
						<LogIn className="h-8 w-8 text-accent" />
					</div>
					<h2 className="text-xl font-bold text-text-primary">
						Welcome back to Trackify
					</h2>
					<p className="mt-2 text-sm text-text-muted">
						Sign in with Google to access your internal workspace.
					</p>
				</div>
				<button
					className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
					onClick={() => {
						if (!loading) signInWithGoogle();
					}}
					disabled={loading}
				>
					{loading ? (
						<span className="inline-flex items-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin" />
							Loading...
						</span>
					) : (
						<span className="inline-flex items-center gap-2">
							<svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
								<path d="M21.35 11.1H12v2.98h5.34c-.23 1.27-.95 2.35-2.01 3.08v2.56h3.25c1.9-1.76 3-4.35 3-7.42 0-.62-.06-1.21-.23-1.8Z" />
								<path d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.25-2.56c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.75-5.58-4.13H3.05v2.61A10 10 0 0 0 12 22Z" />
								<path d="M6.42 13.83a6.03 6.03 0 0 1 0-3.66V7.56H3.05a10 10 0 0 0 0 8.88l3.37-2.61Z" />
								<path d="M12 6.04c1.46 0 2.77.5 3.8 1.46l2.83-2.84A9.86 9.86 0 0 0 12 2a10 10 0 0 0-8.95 5.56l3.37 2.61c.78-2.38 2.98-4.13 5.58-4.13Z" />
							</svg>
							Login with Google
						</span>
					)}
				</button>
			</div>
		</div>
	);
};

export default Login;
