import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminShell } from './components/layout/AdminShell';
import { StudentShell } from './components/layout/StudentShell';
import {
  StudentPrototypeProvider,
  type StudentPrototypeProviderProps,
} from './context/StudentPrototypeContext';
import { AdminBatchDetailPage } from './pages/admin/AdminBatchDetailPage';
import { AdminBatchFormPage } from './pages/admin/AdminBatchFormPage';
import { AdminBatchManagementPage } from './pages/admin/AdminBatchManagementPage';
import { AdminRequestQueuePage } from './pages/admin/AdminRequestQueuePage';
import { AdminStudentDetailPage } from './pages/admin/AdminStudentDetailPage';
import { StudentBatchDetailPage } from './pages/student/StudentBatchDetailPage';
import { StudentBatchListPage } from './pages/student/StudentBatchListPage';

export const AppRoutes: React.FC<
  Pick<
    StudentPrototypeProviderProps,
    'initialStudentId' | 'initialReferenceDate' | 'initialActorRole'
  >
> = ({ initialStudentId, initialReferenceDate, initialActorRole }) => {
  return (
    <StudentPrototypeProvider
      initialStudentId={initialStudentId}
      initialReferenceDate={initialReferenceDate}
      initialActorRole={initialActorRole}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/admin/jat/batches" replace />} />
        <Route
          path="/admin/jat/batches"
          element={
            <AdminShell>
              <AdminBatchManagementPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/jat/batches/create"
          element={
            <AdminShell>
              <AdminBatchFormPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/jat/batches/:batchId"
          element={
            <AdminShell>
              <AdminBatchDetailPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/jat/batches/:batchId/edit"
          element={
            <AdminShell>
              <AdminBatchFormPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/jat/batches/:batchId/students/:studentId"
          element={
            <AdminShell>
              <AdminStudentDetailPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/jat/requests"
          element={
            <AdminShell>
              <AdminRequestQueuePage />
            </AdminShell>
          }
        />
        <Route
          path="/student/talent-support/jat"
          element={
            <StudentShell>
              <StudentBatchListPage />
            </StudentShell>
          }
        />
        <Route
          path="/student/talent-support/jat/:batchId"
          element={
            <StudentShell>
              <StudentBatchDetailPage />
            </StudentShell>
          }
        />
        <Route path="*" element={<Navigate to="/admin/jat/batches" replace />} />
      </Routes>
    </StudentPrototypeProvider>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;

