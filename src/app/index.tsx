import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import ReactDOM from 'react-dom/client';
import store from '@redux/store/store';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './routing/routes';
import './styles/index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>
				<App />
				<Toaster
					position="top-right"
					toastOptions={{
						style: {
							background: 'var(--color-surface)',
							color: 'var(--color-text-primary)',
							border: '1px solid var(--color-border)',
							borderRadius: '0.75rem',
							fontSize: '0.875rem',
						},
					}}
				/>
			</Provider>
		</QueryClientProvider>
	</React.StrictMode>,
);
