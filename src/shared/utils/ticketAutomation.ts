import dayjs from 'dayjs';
import { Ticket } from '@/constants/types';

export interface AutomationRulesConfig {
	enableDueDateRule: boolean;
	enableStaleInProgressRule: boolean;
	enableTodoAgingRule: boolean;
}

export const defaultAutomationRules: AutomationRulesConfig = {
	enableDueDateRule: true,
	enableStaleInProgressRule: true,
	enableTodoAgingRule: true,
};

const parseDate = (value: any): dayjs.Dayjs | null => {
	if (!value) return null;
	if (typeof value?.toDate === 'function') return dayjs(value.toDate());
	if (value instanceof Date) return dayjs(value);
	if (typeof value === 'string') {
		if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
			const [day, month, year] = value.split('-');
			return dayjs(`${year}-${month}-${day}`);
		}
		return dayjs(value);
	}
	return null;
};

export const applyAutomationRules = (
	ticket: Partial<Ticket>,
	rules: AutomationRulesConfig = defaultAutomationRules,
): Pick<Ticket, 'slaStatus' | 'escalationLevel'> => {
	const status = String(ticket.status || '').toUpperCase();

	if (status === 'DONE' || status === 'CANCELED') {
		return { slaStatus: 'ON_TRACK', escalationLevel: 0 };
	}

	let slaStatus: Ticket['slaStatus'] = 'ON_TRACK';
	let escalationLevel = 0;

	const now = dayjs();
	const dueDate = parseDate(ticket.dueDate);
	const createdAt = parseDate(ticket.createdAt);

	if (rules.enableDueDateRule && dueDate?.isValid()) {
		if (dueDate.isBefore(now)) {
			slaStatus = 'BREACHED';
			escalationLevel = Math.max(escalationLevel, 2);
		} else if (dueDate.diff(now, 'hour') <= 24) {
			slaStatus = 'AT_RISK';
			escalationLevel = Math.max(escalationLevel, 1);
		}
	}

	if (
		rules.enableStaleInProgressRule &&
		status === 'DOING' &&
		createdAt?.isValid() &&
		now.diff(createdAt, 'hour') >= 72
	) {
		if (slaStatus !== 'BREACHED') slaStatus = 'AT_RISK';
		escalationLevel = Math.max(escalationLevel, 1);
	}

	if (
		rules.enableTodoAgingRule &&
		status === 'TODO' &&
		createdAt?.isValid() &&
		now.diff(createdAt, 'hour') >= 120
	) {
		if (slaStatus !== 'BREACHED') slaStatus = 'AT_RISK';
		escalationLevel = Math.max(escalationLevel, 1);
	}

	return {
		slaStatus,
		escalationLevel,
	};
};
