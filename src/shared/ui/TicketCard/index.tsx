import React, { memo } from 'react';
import { Ticket, TicketStatus } from '@/constants/types';
import { useNavigate } from 'react-router-dom';
import { useDrag } from 'react-dnd';
import { Eye, Pencil, Trash2 } from 'lucide-react';

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

interface TicketCardProps {
	ticket: Ticket;
	onStatusChange: (id: string, newStatus: TicketStatus) => void;
	onDelete: (id: string) => void;
	onEdit: (ticket: Ticket) => void;
	statuses: TicketStatus[];
}

const normalizeStatusValue = (value: unknown): TicketStatus => {
	const normalized = String(value || '')
		.toUpperCase()
		.trim();
	if (normalized === 'DOING') return 'DOING';
	if (normalized === 'DONE') return 'DONE';
	if (normalized === 'CANCEL' || normalized === 'CANCELED' || normalized === 'CANCELLED') {
		return 'CANCELED';
	}
	return 'TODO';
};

const TicketCard: React.FC<TicketCardProps> = ({
	ticket,
	onStatusChange,
	onDelete,
	onEdit,
	statuses,
}) => {
	const navigate = useNavigate();
	const [{ isDragging }, drag] = useDrag(() => ({
		type: 'CARD',
		item: { id: ticket.id },
		collect: (monitor) => ({ isDragging: monitor.isDragging() }),
	}));

	const divRef = React.useRef<HTMLDivElement>(null);
	drag(divRef);

	return (
		<div
			ref={divRef}
			className={`mb-3 ${isDragging ? 'opacity-50' : 'opacity-100'} transition-opacity`}
		>
			<div className="rounded-2xl border border-border bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover">
				<div className="mb-3 flex items-start justify-between gap-2">
					<h3 className="text-sm font-semibold text-text-primary">{ticket.title}</h3>
					<div className="flex gap-1">
						<button
							onClick={() => navigate(`/ticket/${ticket.id}`)}
							className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-elevated transition-colors"
						>
							<Eye className="h-4 w-4" />
						</button>
						<button
							onClick={() => onEdit(ticket)}
							className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-elevated transition-colors"
						>
							<Pencil className="h-4 w-4" />
						</button>
						<button
							onClick={() => onDelete(ticket.id!)}
							className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-surface-elevated transition-colors"
						>
							<Trash2 className="h-4 w-4" />
						</button>
					</div>
				</div>
				<p className="line-clamp-4 text-sm text-text-secondary">{ticket.desc}</p>
				<div className="mt-3 flex flex-wrap items-center gap-2">
					<span
						className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getSlaStyles(
							ticket.slaStatus,
						)}`}
					>
						SLA: {ticket.slaStatus || 'ON_TRACK'}
					</span>
					{ticket.dueDate && (
						<span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
							Due: {ticket.dueDate}
						</span>
					)}
				</div>
				<select
					value={normalizeStatusValue(ticket.status)}
					className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent transition-colors"
					onChange={(event) =>
						onStatusChange(ticket.id!, event.target.value as TicketStatus)
					}
				>
					{statuses?.map((status) => (
						<option key={status} value={status}>
							{status.toUpperCase()}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export default memo(TicketCard);
