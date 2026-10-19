import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import {
  INITIAL_MOCK_APPLICATIONS,
  INITIAL_MOCK_BATCHES,
  MOCK_STUDENT_DIRECTORY,
} from '../mocks/jatData';
import { batchRepository, MockBatchRepository } from '../services/batchRepository';
import { validateParticipantAddition } from '../services/batchValidator';

describe('EP-JAT-02 Business Rules, Identity/Membership Separation & Repository Tests (BLG-JAT-007, BLG-JAT-008)', () => {
  let repo: MockBatchRepository;

  beforeEach(() => {
    repo = new MockBatchRepository(
      INITIAL_MOCK_BATCHES,
      MOCK_STUDENT_DIRECTORY,
      INITIAL_MOCK_APPLICATIONS
    );
  });

  it('keeps StudentIdentity distinct from batch membership and initializes derived targets when adding a participant', () => {
    const batchBefore = repo.getBatchById('jat-batch-1')!;
    expect(batchBefore.participants).toHaveLength(3);

    // Add Leslie Alexander (stu-6) and Savannah Nguyen (stu-7) to jat-batch-1
    const updatedBatch = repo.addParticipantsToBatch('jat-batch-1', ['stu-6', 'stu-7']);
    expect(updatedBatch.participants).toHaveLength(5);

    const addedLeslie = updatedBatch.participants.find((p) => p.id === 'stu-6')!;
    expect(addedLeslie).toBeDefined();
    expect(addedLeslie.name).toBe('Leslie Alexander');
    // Derived targets match JAT Batch 1 configuration (Phase 1 = 13, Phase 2 = 10)
    expect(addedLeslie.phase1TargetCount).toBe(13);
    expect(addedLeslie.phase2TargetCount).toBe(10);
    expect(addedLeslie.phase1CompletedCount).toBe(0);
  });

  it('rejects duplicate membership for the same Student in the same batch while allowing enrollment in another batch', () => {
    const batch1 = repo.getBatchById('jat-batch-1')!;
    // stu-1 (Marvin McKinney) is already enrolled in jat-batch-1
    const check = validateParticipantAddition(batch1, ['stu-1'], repo.listDirectoryStudents());
    expect(check.valid).toBe(false);
    expect(check.error).toMatch(/sudah terdaftar/i);
    expect(check.duplicateStudentNames).toContain('Marvin McKinney');

    expect(() => repo.addParticipantsToBatch('jat-batch-1', ['stu-1'])).toThrow(
      /sudah terdaftar/i
    );

    // However, stu-1 CAN be added to jat-batch-3 where stu-1 is not yet a member
    const batch3Updated = repo.addParticipantsToBatch('jat-batch-3', ['stu-1']);
    expect(batch3Updated.participants.some((p) => p.id === 'stu-1')).toBe(true);
    // Phase 1 target on jat-batch-3 is 10, Phase 2 is disabled (0)
    const stu1InBatch3 = batch3Updated.participants.find((p) => p.id === 'stu-1')!;
    expect(stu1InBatch3.phase1TargetCount).toBe(10);
    expect(stu1InBatch3.phase2TargetCount).toBe(0);
  });

  it('requires explicit confirmation to remove a participant and preserves StudentIdentity and archived applications upon removal', () => {
    // Unconfirmed removal must throw and preserve membership
    expect(() => repo.removeParticipantFromBatch('jat-batch-1', 'stu-1', false)).toThrow(
      /konfirmasi eksplisit diperlukan/i
    );
    expect(repo.getParticipantInBatch('jat-batch-1', 'stu-1')).toBeDefined();

    // Confirmed removal removes membership from jat-batch-1
    const updated = repo.removeParticipantFromBatch('jat-batch-1', 'stu-1', true);
    expect(updated.participants.some((p) => p.id === 'stu-1')).toBe(false);
    expect(repo.getParticipantInBatch('jat-batch-1', 'stu-1')).toBeUndefined();

    // StudentIdentity in directory is still preserved (distinct from batch membership)
    const identity = repo.getStudentIdentityById('stu-1');
    expect(identity).toBeDefined();
    expect(identity?.name).toBe('Marvin McKinney');

    // Historical application submissions are preserved in archive (not silently deleted)
    const archivedApps = repo.listStudentApplications('jat-batch-1', 'stu-1');
    expect(archivedApps.length).toBeGreaterThan(0);

    // Re-adding stu-1 restores derived approved counts from preserved applications
    const reEnrolled = repo.addParticipantsToBatch('jat-batch-1', ['stu-1']);
    const restoredMember = reEnrolled.participants.find((p) => p.id === 'stu-1')!;
    expect(restoredMember.phase1CompletedCount).toBe(2); // 2 Approved applications in INITIAL_MOCK_APPLICATIONS
  });

  it('supports participant search across name, email, baseProgram, and bootcampCohortName', () => {
    expect(
      repo.listParticipantsInBatch('jat-batch-1', { searchQuery: 'caldwell' })
    ).toHaveLength(1);
    expect(
      repo.listParticipantsInBatch('jat-batch-1', { searchQuery: 'Batch 21' })
    ).toHaveLength(1);
    expect(
      repo.listParticipantsInBatch('jat-batch-1', {
        pacingStatuses: ['Needs Reminder'],
      })
    ).toHaveLength(1);
  });
});

describe('EP-JAT-02 UI Workflow Integration Tests (BLG-JAT-005, BLG-JAT-006, BLG-JAT-008)', () => {
  beforeEach(() => {
    batchRepository.resetToDefault();
  });

  it('displays batch participants, supports search & filter empty state recovery, and adds a new student via modal', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/jat/batches/jat-batch-1']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Displays initial 3 participants in JAT Batch 1
    expect(screen.getByText('Marvin McKinney')).toBeInTheDocument();
    expect(screen.getByText('Ethan Caldwell')).toBeInTheDocument();
    expect(screen.getByText('Annette Black')).toBeInTheDocument();

    // Search for non-existent participant -> shows Filter Empty State (bd86c33d)
    const searchInput = screen.getByLabelText('Cari Nama atau Email Siswa');
    await user.type(searchInput, 'Sarah Jenkins NonExistent');
    expect(screen.getByText('Tidak Ada Siswa yang Sesuai Filter')).toBeInTheDocument();

    // Recover using Reset Filter button
    const resetButtons = screen.getAllByRole('button', { name: /Reset Filter/i });
    await user.click(resetButtons[0]);
    expect(screen.getByText('Marvin McKinney')).toBeInTheDocument();

    // Open Add Student Modal (+ Tambah Student)
    await user.click(screen.getByRole('button', { name: /\+ Tambah Student/i }));
    const modal = screen.getByRole('dialog');
    expect(
      within(modal).getByRole('heading', { name: /Tambah Student ke Batch JAT/i })
    ).toBeInTheDocument();

    // Already enrolled student (Marvin McKinney) is marked and checkbox is disabled
    expect(within(modal).getAllByText(/Sudah Terdaftar di Batch Ini/i).length).toBeGreaterThan(0);
    expect(within(modal).getByLabelText('Pilih Marvin McKinney')).toBeDisabled();

    // Search inside Add Student Modal for non-existent student -> Empty Search State (7cbdaf40)
    const modalSearch = within(modal).getByLabelText('Cari nama mahasiswa atau email');
    await user.type(modalSearch, 'Alexander Wright');
    expect(within(modal).getByText('Mahasiswa Tidak Ditemukan')).toBeInTheDocument();

    await user.click(within(modal).getByRole('button', { name: /Reset Pencarian/i }));

    // Select Leslie Alexander and submit
    const leslieCheckbox = within(modal).getByLabelText('Pilih Leslie Alexander');
    await user.click(leslieCheckbox);
    await user.click(
      within(modal).getByRole('button', { name: /\+ Tambahkan ke Batch \(1\)/i })
    );

    // Modal closes, status banner appears, and Leslie Alexander is listed in the batch roster
    expect(
      await screen.findByText(/1 mahasiswa berhasil ditambahkan ke JAT Batch 1/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Leslie Alexander')).toBeInTheDocument();
  });

  it('displays participant details, phase/range progress matrix, and standardized Applied Jobs on AdminStudentDetailPage', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/jat/batches/jat-batch-1/students/stu-1']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Student Identity & Quick Stats
    expect(screen.getByRole('heading', { name: 'Detail Student' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Marvin McKinney' })).toBeInTheDocument();
    expect(screen.getByText('marvin.mckinney@example.com')).toBeInTheDocument();
    expect(screen.getByText('+62 812-0100-0001')).toBeInTheDocument();

    // Applied Jobs table with standardized DSN-TBD-01 status badges
    expect(screen.getByText('Bank Negara Indonesia (BNI)')).toBeInTheDocument();
    expect(screen.getByText('Traveloka Indonesia')).toBeInTheDocument();
    expect(screen.getByText('Bukalapak')).toBeInTheDocument();
    expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Waiting Confirmation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);

    // Search Applied Jobs by company
    const jobSearch = screen.getByLabelText('Cari company atau role lamaran');
    await user.type(jobSearch, 'Traveloka');
    expect(screen.getByText('Traveloka Indonesia')).toBeInTheDocument();
    expect(screen.queryByText('Bukalapak')).not.toBeInTheDocument();
  });

  it('preserves participant when canceling removal and removes participant only after explicit confirmation', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/jat/batches/jat-batch-1']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Click remove button for Ethan Caldwell
    await user.click(screen.getByLabelText('Hapus Ethan Caldwell dari batch'));
    const modal = screen.getByRole('dialog');
    expect(
      within(modal).getByRole('heading', { name: /Hapus Student dari JAT Batch 1\?/i })
    ).toBeInTheDocument();

    // Cancel removal -> Ethan Caldwell remains in the table
    await user.click(within(modal).getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Ethan Caldwell')).toBeInTheDocument();

    // Open remove modal again and confirm removal
    await user.click(screen.getByLabelText('Hapus Ethan Caldwell dari batch'));
    const confirmModal = screen.getByRole('dialog');
    await user.click(
      within(confirmModal).getByRole('button', { name: /Ya, Hapus Student/i })
    );

    expect(screen.queryByText('Ethan Caldwell')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Mahasiswa "Ethan Caldwell" telah dihapus dari keanggotaan JAT Batch 1/i)
    ).toBeInTheDocument();
  });
});
