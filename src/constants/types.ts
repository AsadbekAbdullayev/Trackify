// src/constants/types.ts
export type TicketStatus = 'TODO' | 'DOING' | 'DONE' | 'CANCELED';
export type SlaStatus = 'ON_TRACK' | 'AT_RISK' | 'BREACHED';

export interface Ticket {
	id?: string;
	title: string;
	desc: string;
	status: TicketStatus;
	createdAt: any;
	dueDate?: string;
	slaTargetHours?: number;
	slaStatus?: SlaStatus;
	escalationLevel?: number;
}
