import React from 'react';
import { useNavigate } from 'react-router-dom';
import trackify from '@/logos/trackify.png';
import {
	ArrowRight,
	BarChart3,
	BrainCircuit,
	Clock3,
	KanbanSquare,
	MessageSquareMore,
	ShieldCheck,
} from 'lucide-react';

const previewCards = [
	{
		title: 'Plan, prioritize, and ship faster',
		description:
			'When Kanban boards, analytics, and assignment flow work together, teams keep momentum and deliver faster.',
		image: '/images/home-team-dashboard.jpg',
		alt: 'Team planning with dashboard',
	},
	{
		title: 'Clear visibility for engineering operations',
		description:
			'Status progression and KPI tracking help teams identify bottlenecks early and improve throughput.',
		image: '/images/home-engineering-workflow.jpg',
		alt: 'Software engineering workflow',
	},
];

const Home: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-background text-text-primary">
			<nav className="border-b border-border bg-surface">
				<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
					<img src={trackify} alt="logo" className="w-28" />
					<button
						onClick={() => navigate('/login')}
						className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
					>
						Sign In
					</button>
				</div>
			</nav>
			<main className="mx-auto w-full max-w-6xl px-6 py-14">
				<section className="mb-8 rounded-3xl border border-border bg-surface p-8 shadow-card md:p-12">
					<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
						Internal SaaS Workspace
					</p>
					<h1 className="max-w-3xl text-3xl font-bold text-text-primary md:text-5xl">
						Modern task tracking for focused teams.
					</h1>
					<p className="mt-4 max-w-2xl text-sm text-text-secondary">
						Trackify keeps your workflows visible, your priorities clear, and your
						team aligned with simple boards and actionable analytics.
					</p>
					<div className="mt-6">
						<button
							onClick={() => navigate('/login')}
							className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
						>
							<span className="inline-flex items-center gap-2">
								Get Started
								<ArrowRight className="h-4 w-4" />
							</span>
						</button>
					</div>
				</section>
				<section className="mb-8 grid gap-4 md:grid-cols-3">
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
							<Clock3 className="h-5 w-5 text-accent" />
						</div>
						<p className="text-3xl font-bold text-text-primary">~20%</p>
						<p className="mt-2 text-sm text-text-secondary">
							McKinsey research indicates that knowledge workers spend about 20%
							of their time searching for the information they need.
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
							<BrainCircuit className="h-5 w-5 text-accent" />
						</div>
						<p className="text-3xl font-bold text-text-primary">23 min</p>
						<p className="mt-2 text-sm text-text-secondary">
							UC Irvine research shows it can take more than 23 minutes to fully
							regain focus after an interruption.
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
							<MessageSquareMore className="h-5 w-5 text-accent" />
						</div>
						<p className="text-3xl font-bold text-text-primary">Real-time</p>
						<p className="mt-2 text-sm text-text-secondary">
							A shared workspace where status, ownership, and collaboration stay
							in one place to reduce context switching.
						</p>
					</div>
				</section>
				<section className="mb-8 grid gap-4 lg:grid-cols-2">
					{previewCards.map((card) => (
						<div
							key={card.title}
							className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card"
						>
							<img
								src={card.image}
								alt={card.alt}
								className="h-60 w-full object-cover"
							/>
							<div className="p-6">
								<h3 className="text-lg font-semibold text-text-primary">
									{card.title}
								</h3>
								<p className="mt-2 text-sm text-text-secondary">
									{card.description}
								</p>
							</div>
						</div>
					))}
				</section>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-card hover:shadow-card-hover transition-shadow">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
							<KanbanSquare className="h-5 w-5 text-accent" />
						</div>
						<h3 className="text-lg font-semibold text-text-primary">Kanban Board</h3>
						<p className="mt-2 text-sm text-text-secondary">
							Move tickets across stages with smooth drag-and-drop.
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-card hover:shadow-card-hover transition-shadow">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
							<BarChart3 className="h-5 w-5 text-accent" />
						</div>
						<h3 className="text-lg font-semibold text-text-primary">Analytics</h3>
						<p className="mt-2 text-sm text-text-secondary">
							Visualize status distribution and export reports instantly.
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-surface p-6 shadow-card hover:shadow-card-hover transition-shadow">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
							<ShieldCheck className="h-5 w-5 text-accent" />
						</div>
						<h3 className="text-lg font-semibold text-text-primary">
							Secure Access
						</h3>
						<p className="mt-2 text-sm text-text-secondary">
							Google-authenticated, user-scoped data for internal operations.
						</p>
					</div>
				</div>
				<section className="mt-8 rounded-3xl border border-border bg-surface p-8 shadow-card">
					<h2 className="text-xl font-bold text-text-primary">New capabilities</h2>
					<div className="mt-4 grid gap-3 md:grid-cols-2">
						<div className="rounded-2xl border border-border bg-background p-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
								Feature
							</p>
							<p className="mt-2 text-sm font-semibold text-text-primary">
								Dark mode + persistent theme
							</p>
							<p className="mt-1 text-sm text-text-secondary">
								The interface now supports light and dark themes with persistent
								user preference.
							</p>
						</div>
						<div className="rounded-2xl border border-border bg-background p-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
								Feature
							</p>
							<p className="mt-2 text-sm font-semibold text-text-primary">
								Ticket search & filter
							</p>
							<p className="mt-1 text-sm text-text-secondary">
								Search by title/description and filter by status to find tasks
								faster.
							</p>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default Home;
