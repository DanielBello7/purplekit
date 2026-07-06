import { Route, Routes, useLocation } from 'react-router';
import { ApiPage } from '../pages/api';
import { CommandsPage } from '../pages/commands';
import { ConfigPage } from '../pages/config';
import { ExamplePage } from '../pages/example';
import { HomePage } from '../pages/home';
import { NotFoundPage } from '../pages/not-found';

export const AppRoutes = () => {
  const location = useLocation();
  const key = location.pathname.split('/')[1] || 'root';

  return (
    <Routes location={location} key={key}>
      <Route path="/" element={<HomePage />} />
      <Route path="commands" element={<CommandsPage />} />
      <Route path="config" element={<ConfigPage />} />
      <Route path="example" element={<ExamplePage />} />
      <Route path="api" element={<ApiPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
