import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { RootState } from '@/redux/store/store';
import Trackify from '@/logos/trackify.png';
import { useSelector } from 'react-redux';
import {
	ChartPie,
	ChevronLeft,
	ChevronRight,
	KanbanSquare,
	LogOut,
	Menu,
	MoonStar,
	SunMedium,
	User,
} from 'lucide-react';

const AppLayout = () => {
	const { userDetails } = useSelector((state: RootState) => state.generel);
	const [collapsed, setCollapsed] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [darkMode, setDarkMode] = useState(false);
	const { name, photoURL } = userDetails;
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
		setDarkMode(shouldUseDark);
		document.documentElement.classList.toggle('dark', shouldUseDark);
	}, []);

	const handleThemeToggle = () => {
		setDarkMode((prev) => {
			const next = !prev;
			document.documentElement.classList.toggle('dark', next);
			localStorage.setItem('theme', next ? 'dark' : 'light');
			return next;
		});
	};

	const handleMenu = (key: string) => {
		if (key === 'logout') {
			localStorage.removeItem('user_uid');
			navigate('/');
		} else {
			navigate(`/${key}`);
		}
	};

	const menuItems = [
		{
			key: 'dashboard',
			icon: <ChartPie className="h-4 w-4 shrink-0" />,
			label: 'Dashboard',
		},
		{
			key: 'ticket',
			icon: <KanbanSquare className="h-4 w-4 shrink-0" />,
			label: 'My Ticket',
		},
	];

	return (
		<div className="flex min-h-screen bg-background text-text-primary">
			<aside
				className={`${
					collapsed ? 'w-[60px]' : 'w-64'
				} border-r border-border bg-surface px-3 py-4 transition-all duration-300`}
			>
				<div className="mb-6 flex items-center justify-between">
					<img
						src={Trackify}
						alt="logo"
						className={`${collapsed ? 'w-8' : 'w-28'} transition-all duration-300`}
					/>
					<button
						onClick={() => setCollapsed((prev) => !prev)}
						className="hidden h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:bg-surface-elevated md:flex"
					>
						{collapsed ? (
							<ChevronRight className="h-4 w-4" />
						) : (
							<ChevronLeft className="h-4 w-4" />
						)}
					</button>
				</div>
				<nav className="space-y-1">
					{menuItems.map((item) => {
						const isActive = location.pathname.startsWith(`/${item.key}`);
						return (
							<button
								key={item.key}
								onClick={() => handleMenu(item.key)}
								className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
									isActive
										? 'bg-accent-light text-accent'
										: 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
								}`}
							>
								{item.icon}
								{!collapsed && <span>{item.label}</span>}
							</button>
						);
					})}
				</nav>
			</aside>
			<div className="flex flex-1 flex-col">
				<header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
					<button
						onClick={() => setCollapsed((prev) => !prev)}
						className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:bg-surface-elevated md:hidden"
					>
						<Menu className="h-4 w-4" />
					</button>
					<div className="ml-auto flex items-center gap-2">
						<button
							onClick={handleThemeToggle}
							className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:bg-surface-elevated transition-colors"
						>
							{darkMode ? (
								<SunMedium className="h-4 w-4" />
							) : (
								<MoonStar className="h-4 w-4" />
							)}
						</button>
						<div className="relative">
						<button
							onClick={() => setProfileOpen((prev) => !prev)}
							className="flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1 hover:bg-surface-elevated"
						>
							{photoURL ? (
								<img
									src={photoURL}
									alt="user"
									className="h-8 w-8 rounded-full object-cover"
								/>
							) : (
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light">
									<User className="h-4 w-4 text-accent" />
								</div>
							)}
							<span className="text-sm font-medium text-text-primary">
								{name || 'Admin'}
							</span>
						</button>
						{profileOpen && (
							<div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] animate-fade-in rounded-xl border border-border bg-surface p-1 shadow-elevated">
								<button
									onClick={() => handleMenu('logout')}
									className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-surface-elevated transition-colors"
								>
									<LogOut className="h-4 w-4" />
									Logout
								</button>
							</div>
						)}
						</div>
					</div>
				</header>
				<div className="min-h-0 flex-1 overflow-auto bg-background px-6 py-4">
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default AppLayout;
