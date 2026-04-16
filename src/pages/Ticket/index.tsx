import React, { useEffect, useMemo, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Ticket, TicketStatus } from '@/constants/types';
import { TicketCard, Loader } from '@/shared/ui';
import { DndProvider } from 'react-dnd';
import Column from './ui/Column';
import {
	ChevronLeft,
	ChevronRight,
	Cog,
	ListChecks,
	Plus,
	Search,
	SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
	useGetTickets,
	useCreateTicket,
	useUpdateTicket,
	useDeleteTicket,
} from '@/entities/Tickets';
import {
	applyAutomationRules,
	AutomationRulesConfig,
	defaultAutomationRules,
} from '@/shared/utils/ticketAutomation';

const statuses: TicketStatus[] = ['TODO', 'DOING', 'DONE', 'CANCELED'];
const FILTER_STORAGE_KEY = 'ticket_filters_v1';
const AUTOMATION_RULES_STORAGE_KEY = 'ticket_automation_rules_v1';
const ITEMS_PER_PAGE = 8;

type SortValue = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

const normalizeStatus = (value: unknown): TicketStatus => {
	const normalized = String(value || '')
		.toUpperCase()
		.trim();
	if (normalized === 'TODO') return 'TODO';
	if (normalized === 'DOING') return 'DOING';
	if (normalized === 'DONE') return 'DONE';
	if (normalized === 'CANCEL' || normalized === 'CANCELED' || normalized === 'CANCELLED') {
		return 'CANCELED';
	}
	return 'TODO';
};

const parseCreatedAt = (value: any): number => {
	if (!value) return 0;
	if (typeof value?.toDate === 'function') return value.toDate().getTime();
	if (value instanceof Date) return value.getTime();
	if (typeof value === 'string') {
		const dateLike = value.match(/^\d{2}-\d{2}-\d{4}$/)
			? new Date(value.split('-').reverse().join('-'))
			: new Date(value);
		const time = dateLike.getTime();
		return Number.isNaN(time) ? 0 : time;
	}
	return 0;
};

const MyTickets: React.FC = () => {
	const { data: tickets, isLoading } = useGetTickets();
	const createMutation = useCreateTicket();
	const updateMutation = useUpdateTicket();
	const deleteMutation = useDeleteTicket();
	const [modalOpen, setModalOpen] = useState(false);
	const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
	const [formValues, setFormValues] = useState<{
		title: string;
		desc: string;
		status: TicketStatus;
		dueDate: string;
		slaTargetHours: number;
	}>({
		title: '',
		desc: '',
		status: 'TODO',
		dueDate: '',
		slaTargetHours: 72,
	});
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');
	const [sortBy, setSortBy] = useState<SortValue>('newest');
	const [currentPage, setCurrentPage] = useState(1);
	const [automationRules, setAutomationRules] = useState<AutomationRulesConfig>(
		defaultAutomationRules,
	);

	useEffect(() => {
		const saved = localStorage.getItem(FILTER_STORAGE_KEY);
		if (!saved) return;
		try {
			const parsed = JSON.parse(saved) as {
				searchTerm?: string;
				statusFilter?: 'ALL' | TicketStatus;
				sortBy?: SortValue;
			};
			setSearchTerm(parsed.searchTerm || '');
			setStatusFilter(parsed.statusFilter || 'ALL');
			setSortBy(parsed.sortBy || 'newest');
		} catch (error) {
			console.error('Failed to parse saved ticket filters', error);
		}
	}, []);

	useEffect(() => {
		const savedRules = localStorage.getItem(AUTOMATION_RULES_STORAGE_KEY);
		if (!savedRules) return;
		try {
			setAutomationRules({
				...defaultAutomationRules,
				...JSON.parse(savedRules),
			});
		} catch (error) {
			console.error('Failed to parse automation rules config', error);
		}
	}, []);

	const normalizedTickets = tickets || [];

	const handleCreateOrUpdate = () => {
		if (!formValues.title.trim() || !formValues.desc.trim()) {
			toast.error('Please fill all required fields.');
			return;
		}

		if (editingTicket) {
			const patch = {
				...formValues,
				...applyAutomationRules(
					{
						...editingTicket,
						...formValues,
					},
					automationRules,
				),
			};
			updateMutation.mutate({
				id: editingTicket.id!,
				data: patch,
			});
			toast.success('Ticket updated!');
		} else {
			const payload = {
				...formValues,
				createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
			};
			createMutation.mutate({
				...payload,
				...applyAutomationRules(payload, automationRules),
			});
			toast.success('Ticket created!');
		}
		setModalOpen(false);
		setEditingTicket(null);
		setFormValues({
			title: '',
			desc: '',
			status: 'TODO',
			dueDate: '',
			slaTargetHours: 72,
		});
	};

	const handleDelete = (id: string) => {
		deleteMutation.mutate(id);
		toast.success('Ticket deleted!');
	};

	const handleStatusChange = (id: string, newStatus: TicketStatus) => {
		const currentTicket = normalizedTickets.find((ticket: Ticket) => ticket.id === id);
		updateMutation.mutate({
			id,
			data: {
				status: newStatus,
				...applyAutomationRules(
					{
						...currentTicket,
						status: newStatus,
					},
					automationRules,
				),
			},
		});
	};

	const handleDrop = (id: string, newStatus: TicketStatus) => {
		handleStatusChange(id, newStatus);
	};

	const handleEdit = (ticket: Ticket) => {
		setEditingTicket(ticket);
		setFormValues({
			title: ticket.title,
			desc: ticket.desc,
			status: ticket.status,
			dueDate: ticket.dueDate || '',
			slaTargetHours: ticket.slaTargetHours || 72,
		});
		setModalOpen(true);
	};

	const filteredAndSortedTickets = useMemo(() => {
		const query = searchTerm.trim().toLowerCase();
		const filtered = normalizedTickets.filter((ticket: any) => {
			const matchesStatus =
				statusFilter === 'ALL'
					? true
					: normalizeStatus(ticket.status) === statusFilter;
			const matchesSearch = query
				? `${ticket.title} ${ticket.desc}`.toLowerCase().includes(query)
				: true;
			return matchesStatus && matchesSearch;
		});

		return filtered.sort((a: any, b: any) => {
			if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
			if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
			if (sortBy === 'oldest')
				return parseCreatedAt(a.createdAt) - parseCreatedAt(b.createdAt);
			return parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt);
		});
	}, [normalizedTickets, searchTerm, statusFilter, sortBy]);

	const totalPages = Math.max(1, Math.ceil(filteredAndSortedTickets.length / ITEMS_PER_PAGE));
	const paginatedTickets = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredAndSortedTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [filteredAndSortedTickets, currentPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, statusFilter, sortBy]);

	useEffect(() => {
		if (currentPage > totalPages) setCurrentPage(totalPages);
	}, [currentPage, totalPages]);

	const saveCurrentFilters = () => {
		localStorage.setItem(
			FILTER_STORAGE_KEY,
			JSON.stringify({ searchTerm, statusFilter, sortBy }),
		);
		toast.success('Filters saved');
	};

	const resetFilters = () => {
		setSearchTerm('');
		setStatusFilter('ALL');
		setSortBy('newest');
		localStorage.removeItem(FILTER_STORAGE_KEY);
		toast.success('Filters reset');
	};

	const toggleRule = (key: keyof AutomationRulesConfig) => {
		const updatedRules = {
			...automationRules,
			[key]: !automationRules[key],
		};
		setAutomationRules(updatedRules);
		localStorage.setItem(
			AUTOMATION_RULES_STORAGE_KEY,
			JSON.stringify(updatedRules),
		);
	};

	const handleRunAutomation = async () => {
		try {
			await Promise.all(
				normalizedTickets.map((ticket: Ticket) =>
					updateMutation.mutateAsync({
						id: ticket.id!,
						data: applyAutomationRules(ticket, automationRules),
					}),
				),
			);
			toast.success('Automation rules applied to all tickets');
		} catch (error) {
			toast.error('Failed to run automation rules');
		}
	};

	if (isLoading) return <Loader />;

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold text-text-primary">My Tickets</h1>
						<p className="text-sm text-text-muted">
							Track, move and update your tasks quickly.
						</p>
					</div>
					<button
						onClick={() => {
							setEditingTicket(null);
							setFormValues({
								title: '',
								desc: '',
								status: 'TODO',
								dueDate: '',
								slaTargetHours: 72,
							});
							setModalOpen(true);
						}}
						className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
					>
						<span className="inline-flex items-center gap-2">
							<Plus className="h-4 w-4" />
							Add Ticket
						</span>
					</button>
				</div>
				<div className="grid gap-3 md:grid-cols-4">
					<div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
						<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
							Total tasks
						</p>
						<p className="mt-2 text-2xl font-bold text-text-primary">
							{normalizedTickets.length}
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
						<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
							Visible tasks
						</p>
						<p className="mt-2 text-2xl font-bold text-text-primary">
							{filteredAndSortedTickets.length}
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
						<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
							At risk
						</p>
						<p className="mt-2 text-2xl font-bold text-warning">
							{
								normalizedTickets.filter(
									(ticket: Ticket) => ticket.slaStatus === 'AT_RISK',
								).length
							}
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
						<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
							Breached
						</p>
						<p className="mt-2 text-2xl font-bold text-danger">
							{
								normalizedTickets.filter(
									(ticket: Ticket) => ticket.slaStatus === 'BREACHED',
								).length
							}
						</p>
					</div>
				</div>
				<div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
					<div className="mb-3 flex items-center justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
								Automation Rules
							</p>
							<p className="text-sm text-text-secondary">
								Run Jira-style automation and SLA escalation checks.
							</p>
						</div>
						<button
							onClick={handleRunAutomation}
							className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
						>
							<span className="inline-flex items-center gap-2">
								<Cog className="h-4 w-4" />
								Run Rules
							</span>
						</button>
					</div>
					<div className="grid gap-2 md:grid-cols-3">
						<label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
							<input
								type="checkbox"
								checked={automationRules.enableDueDateRule}
								onChange={() => toggleRule('enableDueDateRule')}
							/>
							<span className="text-sm text-text-secondary">Due date breach</span>
						</label>
						<label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
							<input
								type="checkbox"
								checked={automationRules.enableStaleInProgressRule}
								onChange={() => toggleRule('enableStaleInProgressRule')}
							/>
							<span className="text-sm text-text-secondary">Stale in progress</span>
						</label>
						<label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
							<input
								type="checkbox"
								checked={automationRules.enableTodoAgingRule}
								onChange={() => toggleRule('enableTodoAgingRule')}
							/>
							<span className="text-sm text-text-secondary">Old TODO aging</span>
						</label>
					</div>
				</div>
				<div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
					<div className="grid gap-3 md:grid-cols-4">
						<label className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
							<input
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder="Search by title or description"
								className="w-full rounded-xl border border-border bg-surface px-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent transition-colors"
							/>
						</label>
						<label className="relative">
							<SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
							<select
								value={statusFilter}
								onChange={(event) =>
									setStatusFilter(event.target.value as 'ALL' | TicketStatus)
								}
								className="w-full rounded-xl border border-border bg-surface px-10 py-2.5 text-sm text-text-primary focus:border-accent transition-colors"
							>
								<option value="ALL">All statuses</option>
								{statuses.map((status) => (
									<option key={status} value={status}>
										{status}
									</option>
								))}
							</select>
						</label>
						<label className="relative">
							<select
								value={sortBy}
								onChange={(event) => setSortBy(event.target.value as SortValue)}
								className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent transition-colors"
							>
								<option value="newest">Sort: Newest</option>
								<option value="oldest">Sort: Oldest</option>
								<option value="title-asc">Sort: Title A-Z</option>
								<option value="title-desc">Sort: Title Z-A</option>
							</select>
						</label>
						<div className="flex gap-2">
							<button
								onClick={saveCurrentFilters}
								className="w-full rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-elevated transition-colors"
							>
								Save filters
							</button>
							<button
								onClick={resetFilters}
								className="w-full rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-elevated transition-colors"
							>
								Reset
							</button>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-4 overflow-x-auto pb-2 md:flex-row">
					{statuses.map((status) => (
						<Column key={status} status={status} onDrop={handleDrop}>
							{paginatedTickets
								?.filter((t: Ticket) => normalizeStatus(t.status) === status)
								?.map((ticket) => (
									<TicketCard
										key={ticket.id}
										ticket={ticket}
										onDelete={handleDelete}
										onStatusChange={handleStatusChange}
										onEdit={handleEdit}
										statuses={statuses}
									/>
								))}
						</Column>
					))}
				</div>
				{filteredAndSortedTickets.length === 0 && (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-10 text-center shadow-card">
						<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-light">
							<ListChecks className="h-7 w-7 text-accent" />
						</div>
						<h2 className="mb-2 text-xl font-bold text-text-primary">
							No tickets found
						</h2>
						<p className="max-w-sm text-sm text-text-muted">
							No tickets match the current search and filter criteria. Adjust your
							filters or create a new ticket.
						</p>
					</div>
				)}
				{filteredAndSortedTickets.length > 0 && (
					<div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3 shadow-card">
						<p className="text-sm text-text-secondary">
							Page {currentPage} / {totalPages}
						</p>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
								disabled={currentPage === 1}
								className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary hover:bg-surface-elevated transition-colors disabled:opacity-50"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							<button
								onClick={() =>
									setCurrentPage((page) => Math.min(totalPages, page + 1))
								}
								disabled={currentPage === totalPages}
								className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary hover:bg-surface-elevated transition-colors disabled:opacity-50"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				)}

				{modalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
						<div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-elevated animate-slide-up">
							<h2 className="mb-4 text-lg font-semibold text-text-primary">
								{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}
							</h2>
							<div className="space-y-4">
								<div>
									<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
										Title
									</label>
									<input
										value={formValues.title}
										onChange={(event) =>
											setFormValues((prev) => ({
												...prev,
												title: event.target.value,
											}))
										}
										placeholder="Ticket title"
										className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent transition-colors"
									/>
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
										Description
									</label>
									<textarea
										value={formValues.desc}
										onChange={(event) =>
											setFormValues((prev) => ({
												...prev,
												desc: event.target.value,
											}))
										}
										placeholder="Ticket description"
										rows={4}
										className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent transition-colors"
									/>
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
										Status
									</label>
									<select
										value={formValues.status}
										onChange={(event) =>
											setFormValues((prev) => ({
												...prev,
												status: event.target.value as TicketStatus,
											}))
										}
										className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent transition-colors"
									>
										{statuses.map((status) => (
											<option key={status} value={status}>
												{status}
											</option>
										))}
									</select>
								</div>
								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
											Due Date
										</label>
										<input
											type="date"
											value={formValues.dueDate}
											onChange={(event) =>
												setFormValues((prev) => ({
													...prev,
													dueDate: event.target.value,
												}))
											}
											className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent transition-colors"
										/>
									</div>
									<div>
										<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
											SLA Target (hours)
										</label>
										<input
											type="number"
											min={1}
											value={formValues.slaTargetHours}
											onChange={(event) =>
												setFormValues((prev) => ({
													...prev,
													slaTargetHours: Number(event.target.value || 72),
												}))
											}
											className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent transition-colors"
										/>
									</div>
								</div>
							</div>
							<div className="mt-6 flex justify-end gap-2">
								<button
									onClick={() => {
										setModalOpen(false);
										setEditingTicket(null);
									}}
									className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-elevated transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleCreateOrUpdate}
									className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
								>
									{editingTicket ? 'Update' : 'Create'}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</DndProvider>
	);
};

export default MyTickets;
