import React from 'react';
import { useDrop } from 'react-dnd';
import { TicketStatus } from '@/constants/types';

interface ColumnProps {
	status: TicketStatus;
	onDrop: (id: string, newStatus: TicketStatus) => void;
	children: React.ReactNode;
}

const Column: React.FC<ColumnProps> = ({ status, onDrop, children }) => {
	const divRef = React.useRef<HTMLDivElement>(null);
	useDrop({
		accept: 'CARD',
		drop: (item: { id: string }) => onDrop(item.id, status),
		collect: (monitor) => ({}),
		// Attach drop to the ref in useEffect
	})[1](divRef);

	return (
		<div
			ref={divRef}
			className="w-full rounded-2xl border border-border bg-surface p-4 shadow-card md:w-1/4"
		>
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
					{status}
				</h2>
			</div>
			<div className="space-y-2">{children}</div>
		</div>
	);
};

export default Column;
