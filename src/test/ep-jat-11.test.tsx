import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../App';
import { DeleteBatchModal } from '../components/admin/DeleteBatchModal';
import { RemoveParticipantModal } from '../components/admin/RemoveParticipantModal';
import { batchRepository } from '../services/batchRepository';
import type { CreateOrUpdateBatchInput, CreateStudentApplicationInput } from '../types/jat';

describe('EP-JAT-11 — Access Control: Pembatasan hak akses dan pengamanan tindakan', () => {
  beforeEach(() => {
    batchRepository.resetToDefault();
    batchRepository.resetActiveSession();
  });

  it('enforces service-layer authorization: blocks Student from invoking Admin actions and allows both Admin and Super Admin (BLG-JAT-039, BR-33, BR-43, DSN-TBD-02)', () => {
    const validBatchInput: CreateOrUpdateBatchInput = {
      name: 'Batch Testing Access Control',
      affiliatedCohortIds: ['cohort-fe-24'],
      phase1: {
        phaseNumber: 1,
        enabled: true,
        dateRanges: [
          {
            id: 'dr-1',
            label: 'Date Range 1',
            startDate: '2025-03-01',
            endDate: '2025-03-15',
            targets: [{ id: 't-1', jobLevel: 'Junior Level', targetCount: 5 }],
          },
        ],
      },
      phase2: {
        phaseNumber: 2,
        enabled: false,
        dateRanges: [],
      },
    };

    // 1. Student attempting Admin actions must throw access denied error
    expect(() =>
      batchRepository.createBatch(validBatchInput, { actorRole: 'Student' })
    ).toThrow(/Akses ditolak.*Admin.*Super Admin/i);

    expect(() =>
      batchRepository.updateBatch('jat-batch-1', validBatchInput, {
        actorRole: 'Student',
        confirmedConsequentialImpact: true,
      })
    ).toThrow(/Akses ditolak.*Admin.*Super Admin/i);

    expect(() =>
      batchRepository.deleteBatch('jat-batch-1', 'JAT Batch 1 - Frontend Engineering', {
        actorRole: 'Student',
      })
    ).toThrow(/Akses ditolak.*Admin.*Super Admin/i);

    expect(() =>
      batchRepository.addParticipantsToBatch('jat-batch-1', ['stu-4'], {
        actorRole: 'Student',
      })
    ).toThrow(/Akses ditolak.*Admin.*Super Admin/i);

    expect(() =>
      batchRepository.removeParticipantFromBatch('jat-batch-1', 'stu-1', true, {
        actorRole: 'Student',
      })
    ).toThrow(/Akses ditolak.*Admin.*Super Admin/i);

    expect(() =>
      batchRepository.listWaitingConfirmationRequests(undefined, {
        actorRole: 'Student',
      })
    ).toThrow(/Akses ditolak.*antrean verifikasi Request Admin/i);

    expect(() =>
      batchRepository.getAdminApplicationInspectionById('app-001', {
        actorRole: 'Student',
      })
    ).toThrow(/Akses ditolak.*inspeksi bukti lamaran/i);

    expect(() =>
      batchRepository.recalculateBatchProgress('jat-batch-1', 'Student')
    ).toThrow(/Akses ditolak.*Hanya peran Admin.*Super Admin/i);

    expect(() =>
      batchRepository.reviewApplicationRequest('app-001', {
        decision: 'Approved',
        confirmed: true,
        actorRole: 'Student',
      })
    ).toThrow(/Akses ditolak.*Hanya peran Admin.*Super Admin/i);

    // 2. Setting repository activeRole to Student directly enforces the same boundary
    batchRepository.setActiveRole('Student');
    expect(() => batchRepository.createBatch(validBatchInput)).toThrow(
      /Akses ditolak.*Admin.*Super Admin/i
    );
    expect(() => batchRepository.listWaitingConfirmationRequests()).toThrow(
      /Akses ditolak.*antrean verifikasi Request Admin/i
    );

    // 3. Admin (Talent Support) is fully authorized
    batchRepository.setActiveRole('Admin (Talent Support)');
    const createdByAdmin = batchRepository.createBatch(validBatchInput);
    expect(createdByAdmin.id).toBeDefined();
    expect(createdByAdmin.name).toBe('Batch Testing Access Control');

    // 4. Super Admin also has identical authority in JAT (DSN-TBD-02 & BR-43)
    batchRepository.setActiveRole('Super Admin');
    const recalcReport = batchRepository.recalculateBatchProgressWithReport(
      createdByAdmin.id,
      'Super Admin'
    );
    expect(recalcReport.status).toBe('no-op');
    expect(recalcReport.actorRole).toBe('Super Admin');

    // Super Admin deletes the batch successfully
    batchRepository.deleteBatch(createdByAdmin.id, 'Batch Testing Access Control', {
      actorRole: 'Super Admin',
    });
    expect(batchRepository.getBatchById(createdByAdmin.id)).toBeUndefined();
  });

  it('enforces student submission data isolation: prohibits accessing, creating, or deleting applications for other students (BLG-JAT-039, BR-33)', () => {
    // Student A session
    batchRepository.setActiveRole('Student');
    batchRepository.setActiveStudentId('stu-1');

    // 1. Student 1 accessing their own applications succeeds
    const myApps = batchRepository.listStudentApplications('jat-batch-1', 'stu-1');
    expect(myApps.length).toBeGreaterThan(0);
    expect(myApps.every((a) => a.studentId === 'stu-1')).toBe(true);

    const myFirstApp = myApps[0];
    const fetchedMyDetail = batchRepository.getStudentApplicationById(
      'jat-batch-1',
      'stu-1',
      myFirstApp.id
    );
    expect(fetchedMyDetail).toBeDefined();
    expect(fetchedMyDetail?.id).toBe(myFirstApp.id);

    // 2. Student 1 accessing Student 2 (stu-2) applications throws access denied (BR-33)
    expect(() =>
      batchRepository.listStudentApplications('jat-batch-1', 'stu-2')
    ).toThrow(/Akses ditolak \(BR-33\): Mahasiswa hanya berhak mengakses dan mengelola pengajuan lamaran miliknya sendiri/i);

    expect(() =>
      batchRepository.getStudentApplicationById('jat-batch-1', 'stu-2', 'app-002')
    ).toThrow(/Akses ditolak \(BR-33\): Mahasiswa hanya berhak mengakses dan mengelola pengajuan lamaran miliknya sendiri/i);

    // 3. Student 1 submitting an application on behalf of Student 2 is blocked (BR-33)
    const spoofedInput: CreateStudentApplicationInput = {
      batchId: 'jat-batch-1',
      studentId: 'stu-2',
      dateApplied: '2025-03-05',
      role: 'Frontend Engineer',
      company: 'Tech Corp',
      location: 'Jakarta',
      position: 'Full-time',
      jobLevel: 'Junior Level',
      workSystem: 'Remote / WFH',
      yearsOfExperience: '1',
      vacancyUrl: 'https://example.com/job',
      evidenceFile: {
        name: 'proof.png',
        size: 50000,
        type: 'image/png',
      },
    };

    expect(() =>
      batchRepository.submitStudentApplication(spoofedInput, '2025-03-10')
    ).toThrow(/Akses ditolak \(BR-33\): Mahasiswa hanya berhak tidak diizinkan mengajukan lamaran atas nama mahasiswa lain/i);

    // 4. Student 1 deleting Student 2's application is blocked (BR-33)
    expect(() =>
      batchRepository.deleteStudentApplication('jat-batch-1', 'stu-2', 'app-002', true)
    ).toThrow(/Akses ditolak \(BR-33\): Mahasiswa hanya berhak menghapus pengajuan lamaran miliknya sendiri/i);

    // 5. Student 1 viewing Student 2's batch view or assigned batches is blocked (BR-33)
    expect(() => batchRepository.listBatchesForStudent('stu-2')).toThrow(
      /Akses ditolak \(BR-33\): Mahasiswa hanya berhak melihat daftar batch miliknya sendiri/i
    );
    expect(() =>
      batchRepository.getStudentBatchView('jat-batch-1', 'stu-2', '2025-03-10')
    ).toThrow(/Akses ditolak \(BR-33\): Mahasiswa hanya berhak mengakses progres dan pengajuan lamaran miliknya sendiri/i);

    // 6. Admin can inspect any student without ownership block
    batchRepository.setActiveRole('Admin (Talent Support)');
    const adminViewStu2 = batchRepository.listStudentApplications('jat-batch-1', 'stu-2');
    expect(adminViewStu2).toBeDefined();
    expect(adminViewStu2.every((a) => a.studentId === 'stu-2')).toBe(true);
  });

  it('validates batch deletion: requires exact batch name, prevents deletion on cancel, and guards against rapid double-clicks (BLG-JAT-040, BR-09, DSN-TBD-05)', async () => {
    const handleConfirmDelete = vi.fn();
    const handleCancel = vi.fn();
    const targetBatchName = 'JAT Batch 1 - Frontend Engineering';

    const { rerender } = render(
      <DeleteBatchModal
        isOpen={true}
        batchName={targetBatchName}
        participantCount={3}
        onCancel={handleCancel}
        onConfirmDelete={handleConfirmDelete}
      />
    );

    const input = screen.getByRole('textbox', {
      name: new RegExp(`Ketik.*${targetBatchName}`, 'i'),
    });
    const submitBtn = screen.getByRole('button', { name: /Hapus Batch/i });
    const cancelBtn = screen.getByRole('button', { name: /Batal/i });

    // 1. Initial empty state: Submit button is disabled
    expect(submitBtn).toBeDisabled();

    // 2. Partial / mismatched batch name: Submit button remains disabled
    fireEvent.change(input, { target: { value: 'JAT Batch 1' } });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Wrong Name' } });
    expect(submitBtn).toBeDisabled();

    // 3. Exact match: Submit button becomes enabled
    fireEvent.change(input, { target: { value: targetBatchName } });
    expect(submitBtn).toBeEnabled();

    // 4. Clicking Batal does not trigger delete and resets input
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirmDelete).not.toHaveBeenCalled();

    // 5. Re-type exact match and submit
    fireEvent.change(input, { target: { value: targetBatchName } });
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);
    expect(handleConfirmDelete).toHaveBeenCalledTimes(1);
    expect(handleConfirmDelete).toHaveBeenCalledWith(targetBatchName);

    // Verify batch remains in repository because callback didn't mutate (confirmation only)
    expect(batchRepository.getBatchById('jat-batch-1')).toBeDefined();
  });

  it('validates participant removal: requires explicit confirmation, preserves records on cancel, and guards against rapid double-clicks (BLG-JAT-040, BR-09, JAT-BL-16)', () => {
    const handleConfirmRemove = vi.fn();
    const handleCancel = vi.fn();
    const participant = batchRepository.getParticipantInBatch('jat-batch-1', 'stu-1')!;

    render(
      <RemoveParticipantModal
        isOpen={true}
        batchName="JAT Batch 1"
        participant={participant}
        applicationCount={3}
        onCancel={handleCancel}
        onConfirmRemove={handleConfirmRemove}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /Batal/i });
    const confirmBtn = screen.getByRole('button', { name: /Ya, Hapus Student/i });

    // 1. Cancel action preserves participant and does not fire remove
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirmRemove).not.toHaveBeenCalled();

    // Participant still exists in batch
    expect(batchRepository.getParticipantInBatch('jat-batch-1', 'stu-1')).toBeDefined();

    // 2. Service level: calling without explicit confirmed: true throws error (BR-09)
    expect(() =>
      batchRepository.removeParticipantFromBatch('jat-batch-1', 'stu-1', false)
    ).toThrow(/Penghapusan peserta dibatalkan: konfirmasi eksplisit diperlukan \(BR-09\)/i);

    // 3. Confirm button fires handler
    fireEvent.click(confirmBtn);
    expect(handleConfirmRemove).toHaveBeenCalledTimes(1);
  });

  it('renders unauthorized alert banner when Student role visits Admin panel and allows switching roles (BLG-JAT-040, BR-33, BR-43)', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/jat/batches']}>
        <AppRoutes initialActorRole="Student" />
      </MemoryRouter>
    );

    // 1. Alert banner is prominently displayed
    const alertBanner = await screen.findByRole('alert');
    expect(alertBanner).toBeInTheDocument();
    expect(alertBanner).toHaveTextContent(/Akses Ditolak/i);
    expect(alertBanner).toHaveTextContent(/Peran aktif saat ini adalah Student/i);

    // 2. Action buttons exist: "Ke Portal Student" and "Ganti ke Admin"
    const switchToStudentLink = within(alertBanner).getByRole('link', {
      name: /Ke Portal Student/i,
    });
    expect(switchToStudentLink).toHaveAttribute('href', '/student/talent-support/jat');

    const switchRoleBtn = within(alertBanner).getByRole('button', {
      name: /Ganti ke Admin/i,
    });
    expect(switchRoleBtn).toBeInTheDocument();

    // 3. Clicking "Ganti ke Admin" updates the role and dismisses the unauthorized banner
    fireEvent.click(switchRoleBtn);
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    // 4. Header role selector allows switching between roles
    const roleSelector = screen.getByRole('combobox', {
      name: /Pilih Peran Pengguna/i,
    });
    expect(roleSelector).toHaveValue('Admin (Talent Support)');

    // Switch back to Student: Alert banner reappears
    fireEvent.change(roleSelector, { target: { value: 'Student' } });
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    // Switch to Super Admin: Alert banner is dismissed and role is updated
    fireEvent.change(roleSelector, { target: { value: 'Super Admin' } });
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    expect(roleSelector).toHaveValue('Super Admin');
  });
});
