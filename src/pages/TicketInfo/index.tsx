import { useParams, useNavigate } from 'react-router-dom';
import { useGetTickets } from '@/entities/Tickets';
import { ArrowLeft, Circle } from 'lucide-react';
import Loader from '@/shared/ui/Loader';
import { Ticket } from '@/constants/types';

const getStatusStyles = (status: string) => {
	switch (status.toLowerCase()) {
		case 'todo':
			return 'bg-accent-light text-accent';
		case 'doing':
			return 'bg-warning/20 text-warning';
		case 'done':
			return 'bg-success/20 text-success';
		case 'canceled':
			return 'bg-danger/20 text-danger';
		default:
			return 'bg-surface-elevated text-text-secondary';
	}
};

const getSlaStyles = (slaStatus?: Ticket['slaStatus']) => {
	switch (slaStatus) {
		case 'BREACHED':
			return 'bg-danger/20 text-danger';
		case 'AT_RISK':
			return 'bg-warning/20 text-warning';
		default:
			return 'bg-success/20 text-success';
	}
};

const TicketInfo = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { data: tickets, isLoading } = useGetTickets();

	const ticket = (tickets as Ticket[] | undefined)?.find((t) => t.id === id);

	if (isLoading) return <Loader />;
	if (!ticket) return <div className="text-sm text-text-muted">Not Found</div>;

	return (
		<div className="space-y-4">
			<button
				onClick={() => navigate('/ticket')}
				className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-elevated transition-colors"
			>
				<span className="inline-flex items-center gap-2">
					<ArrowLeft className="h-4 w-4" />
					Back to Tickets List
				</span>
			</button>
			<div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
				<h1 className="mb-4 text-xl font-bold text-text-primary">{ticket.title}</h1>
				<div className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
						Description
					</p>
					<p className="text-sm text-text-secondary">{ticket.desc}</p>
				</div>
				<div className="mt-6">
					<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
						Status
					</p>
					<span
						className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(
							ticket.status,
						)}`}
					>
						<Circle className="h-3.5 w-3.5" />
						{ticket.status.toUpperCase()}
					</span>
				</div>
				<div className="mt-6 space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
						SLA Tracking
					</p>
					<div className="flex flex-wrap gap-2">
						<span
							className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getSlaStyles(
								ticket.slaStatus,
							)}`}
						>
							SLA Status: {ticket.slaStatus || 'ON_TRACK'}
						</span>
						{ticket.dueDate && (
							<span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
								Due Date: {ticket.dueDate}
							</span>
						)}
						<span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
							Escalation Level: {ticket.escalationLevel || 0}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TicketInfo;
