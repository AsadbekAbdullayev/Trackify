import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '@/providers/ProtectedRoute';
import TicketInfo from '@/pages/TicketInfo';
import Dashboard from '@/pages/Dashboard';
import MyTickets from '@/pages/Ticket';
import Login from '@/pages/Login';
import AppLayout from '@/layout';
import Home from '@/pages/Home';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Login page */}
				<Route path="/login" element={<Login />} />
				<Route path="" element={<Home />} />

				<Route
					path="/"
					element={
						<PrivateRoute>
							<AppLayout /> {/* Main layout (sidebar, topbar) */}
						</PrivateRoute>
					}
				>
					<Route path="dashboard" element={<Dashboard />} />
					<Route path="ticket" element={<MyTickets />} />
					<Route path="/ticket/:id" element={<TicketInfo />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
