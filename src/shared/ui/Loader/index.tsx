import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
	size?: number;
}

const Loader: React.FC<LoaderProps> = () => {
	return (
		<div className="flex h-screen w-full items-center justify-center bg-background">
			<div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
				<Loader2 className="h-8 w-8 animate-spin text-accent" />
			</div>
		</div>
	);
};

export default Loader;
