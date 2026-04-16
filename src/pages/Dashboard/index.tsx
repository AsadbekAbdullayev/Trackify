import React, { useMemo, useState } from 'react';
import ApexCharts from 'react-apexcharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import CSV from '../../../public/csv.svg';
import Excel from '../../../public/excel.svg';
import dayjs from 'dayjs';
import { CalendarDays, Download } from 'lucide-react';
import { useGetTickets } from '@/entities/Tickets';

const parseCreatedAt = (value: any): dayjs.Dayjs | null => {
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

const Dashboard = () => {
	const { data: tickets = [] } = useGetTickets();
	const [fromDate, setFromDate] = useState('2000-01-01');
	const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));

	const filteredTickets = useMemo(() => {
		const from = dayjs(fromDate).startOf('day');
		const to = dayjs(toDate).endOf('day');
		return tickets.filter((ticket: any) => {
			const createdAt = parseCreatedAt(ticket.createdAt);
			if (!createdAt || !createdAt.isValid()) return false;
			return (
				createdAt.valueOf() >= from.valueOf() &&
				createdAt.valueOf() <= to.valueOf()
			);
		});
	}, [tickets, fromDate, toDate]);

	const statusCounts = useMemo(() => {
		const counts: { [key: string]: number } = {
			TODO: 0,
			DOING: 0,
			DONE: 0,
			CANCELED: 0,
		};
		filteredTickets.forEach((ticket: any) => {
			const status = String(ticket.status).toUpperCase();
			if (counts[status] !== undefined) counts[status]++;
		});
		return counts;
	}, [filteredTickets]);
	const slaCounts = useMemo(() => {
		const counts = {
			ON_TRACK: 0,
			AT_RISK: 0,
			BREACHED: 0,
		};
		filteredTickets.forEach((ticket: any) => {
			const sla = ticket.slaStatus || 'ON_TRACK';
			if (counts[sla as keyof typeof counts] !== undefined) {
				counts[sla as keyof typeof counts]++;
			}
		});
		return counts;
	}, [filteredTickets]);

	const timelineSeries = useMemo(() => {
		const grouped: Record<string, number> = {};
		filteredTickets.forEach((ticket: any) => {
			const date = parseCreatedAt(ticket.createdAt);
			if (!date || !date.isValid()) return;
			const key = date.format('YYYY-MM-DD');
			grouped[key] = (grouped[key] || 0) + 1;
		});

		const dates = Object.keys(grouped).sort((a, b) => dayjs(a).diff(dayjs(b)));
		return {
			categories: dates.map((date) => dayjs(date).format('DD MMM')),
			data: dates.map((date) => grouped[date]),
		};
	}, [filteredTickets]);

	const exportToExcel = () => {
		const worksheet = XLSX.utils.json_to_sheet(filteredTickets);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
		const excelFile = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		saveAs(
			new Blob([excelFile], { type: 'application/octet-stream' }),
			'tickets.xlsx',
		);
	};

	const exportToCSV = () => {
		const csv = filteredTickets.map(
			(ticket: any) =>
				`${ticket.id},${ticket.title},${ticket.desc},${ticket.status}`,
		);
		const csvBlob = new Blob([csv.join('\n')], {
			type: 'text/csv;charset=utf-8;',
		});
		saveAs(csvBlob, 'tickets.csv');
	};

	const statusChartConfig = {
		chart: { type: 'bar', stacked: true, toolbar: { show: false } },
		plotOptions: { bar: { columnWidth: '55%' } },
		series: [
			{
				name: 'TODO',
				data: [{ x: 'Tickets', y: statusCounts.TODO }],
				color: '#8b92ff',
			},
			{
				name: 'DOING',
				data: [{ x: 'Tickets', y: statusCounts.DOING }],
				color: '#6366f1',
			},
			{
				name: 'DONE',
				data: [{ x: 'Tickets', y: statusCounts.DONE }],
				color: '#34d399',
			},
			{
				name: 'CANCELED',
				data: [{ x: 'Tickets', y: statusCounts.CANCELED }],
				color: '#f87171',
			},
		],
		xaxis: { categories: ['Tickets'] },
		legend: { position: 'top' },
		dataLabels: { enabled: false },
	};

	const donutChartConfig = {
		chart: { type: 'donut' },
		labels: ['TODO', 'DOING', 'DONE', 'CANCELED'],
		series: [
			statusCounts.TODO,
			statusCounts.DOING,
			statusCounts.DONE,
			statusCounts.CANCELED,
		],
		colors: ['#8b92ff', '#6366f1', '#34d399', '#f87171'],
		legend: { position: 'bottom' },
		dataLabels: {
			enabled: true,
			style: { fontSize: '14px', fontWeight: 'bold' },
		},
	};

	const timelineChartConfig = {
		chart: { type: 'area', toolbar: { show: false } },
		stroke: { curve: 'smooth', width: 3 },
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.35,
				opacityTo: 0.05,
			},
		},
		colors: ['#6366f1'],
		xaxis: { categories: timelineSeries.categories },
		dataLabels: { enabled: false },
	};

	return (
		<div className="space-y-4">
			<div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
				<div className="mb-4 flex items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-bold text-text-primary">
							Dashboard - Ticket Tracker
						</h1>
						<p className="text-sm text-text-muted">
							Insights and downloadable reports from your board in selected date range.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<label className="relative">
							<CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
							<input
								type="date"
								value={fromDate}
								onChange={(event) => setFromDate(event.target.value)}
								className="rounded-xl border border-border bg-surface px-10 py-2.5 text-sm text-text-primary focus:border-accent transition-colors"
							/>
						</label>
						<label>
							<input
								type="date"
								value={toDate}
								onChange={(event) => setToDate(event.target.value)}
								className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent transition-colors"
							/>
						</label>
						<button
							onClick={exportToExcel}
							className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-elevated transition-colors"
						>
							<span className="inline-flex items-center gap-2">
								<img src={Excel} className="w-4" />
								Excel
							</span>
						</button>
						<button
							onClick={exportToCSV}
							className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
						>
							<span className="inline-flex items-center gap-2">
								<img src={CSV} className="w-4" />
								CSV
								<Download className="h-4 w-4" />
							</span>
						</button>
					</div>
				</div>
				<div className="grid gap-3 md:grid-cols-3">
					<div className="rounded-xl border border-border bg-background p-3">
						<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
							Filtered tickets
						</p>
						<p className="mt-2 text-2xl font-bold text-text-primary">
							{filteredTickets.length}
						</p>
					</div>
					<div className="rounded-xl border border-border bg-background p-3">
						<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
							Completed
						</p>
						<p className="mt-2 text-2xl font-bold text-success">{statusCounts.DONE}</p>
					</div>
					<div className="rounded-xl border border-border bg-background p-3">
						<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
							Open
						</p>
						<p className="mt-2 text-2xl font-bold text-warning">
							{statusCounts.TODO + statusCounts.DOING}
						</p>
					</div>
				</div>
			</div>
			<div className="grid gap-4 lg:grid-cols-3">
				<div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
					<h2 className="mb-3 text-lg font-semibold text-text-primary">
						Ticket Status Overview
					</h2>
					<ApexCharts
						options={donutChartConfig}
						series={donutChartConfig.series}
						type="donut"
						height={320}
					/>
				</div>
				<div className="rounded-2xl border border-border bg-surface p-4 shadow-card lg:col-span-2">
					<h2 className="mb-3 text-lg font-semibold text-text-primary">
						Ticket Count by Status
					</h2>
					<ApexCharts
						options={statusChartConfig}
						series={statusChartConfig.series}
						type="bar"
						height={320}
					/>
				</div>
			</div>
			<div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
				<h2 className="mb-3 text-lg font-semibold text-text-primary">SLA Health</h2>
				<div className="grid gap-3 md:grid-cols-3">
					<div className="rounded-xl border border-border bg-background p-3">
						<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
							On Track
						</p>
						<p className="mt-2 text-2xl font-bold text-success">
							{slaCounts.ON_TRACK}
						</p>
					</div>
					<div className="rounded-xl border border-border bg-background p-3">
						<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
							At Risk
						</p>
						<p className="mt-2 text-2xl font-bold text-warning">
							{slaCounts.AT_RISK}
						</p>
					</div>
					<div className="rounded-xl border border-border bg-background p-3">
						<p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
							Breached
						</p>
						<p className="mt-2 text-2xl font-bold text-danger">
							{slaCounts.BREACHED}
						</p>
					</div>
				</div>
			</div>
			<div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
				<h2 className="mb-3 text-lg font-semibold text-text-primary">
					Ticket Creation Timeline
				</h2>
				<ApexCharts
					options={timelineChartConfig}
					series={[{ name: 'Tickets', data: timelineSeries.data }]}
					type="area"
					height={300}
				/>
			</div>
		</div>
	);
};

export default Dashboard;
