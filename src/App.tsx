import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/SiteLayout';
import { HomePage } from './pages/HomePage';
import { BlogIndexPage } from './pages/BlogIndexPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { LabPage } from './pages/LabPage';
import { AboutPage } from './pages/AboutPage';
import { AdminGatePage } from './pages/admin/AdminGatePage';
import { AdminPostsPage } from './pages/admin/AdminPostsPage';
import { AdminEditorPage } from './pages/admin/AdminEditorPage';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="blog" element={<BlogIndexPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="lab" element={<LabPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="admin" element={<AdminGatePage />} />
        <Route path="admin/posts" element={<AdminPostsPage />} />
        <Route path="admin/posts/:id" element={<AdminEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
