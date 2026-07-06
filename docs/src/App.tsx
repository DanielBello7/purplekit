import { BrowserRouter } from 'react-router';
import { DocsLayout } from './components/docs-layout';
import { AppRoutes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <DocsLayout>
        <AppRoutes />
      </DocsLayout>
    </BrowserRouter>
  );
}

export default App;
