import { BrowserRouter } from 'react-router';
import { DocsLayout } from './components/docs-layout';
import { AppRoutes } from './routes';

function App() {
  return (
    <div className="w-full h-screen">
      <BrowserRouter>
        <DocsLayout>
          <AppRoutes />
        </DocsLayout>
      </BrowserRouter>
    </div>
  );
}

export default App;
