import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import { batchRepository, MockBatchRepository } from '../services/batchRepository';

function renderStudentBatchDetail(
  initialEntry = '/student/talent-support/jat/jat-batch-1',
  initialStudentId = 'stu-1',
  initialReferenceDate = '2025-03-10'
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes
        initialStudentId={initialStudentId}
        initialReferenceDate={initialReferenceDate}
      />
    </MemoryRouter>
  );
}

describe('EP-JAT-07 — Validation Feedback: Penyajian status validasi dan feedback kepada Student', () => {
  beforeEach(() => {
    batchRepository.resetToDefault();
  });

  it('enforces student ownership isolation (BR-33), mandatory rejection reasons (BR-24), human-review history (BR-25), and recruitment stage independence (BR-28) in the repository', () => {
    const repo = new MockBatchRepository();

    // 1. Student stu-1 can retrieve their own application (app-101)
    const ownRecord = repo.getStudentApplicationById('jat-batch-1', 'stu-1', 'app-101');
    expect(ownRecord).toBeDefined();
    expect(ownRecord?.company).toBe('Bank Negara Indonesia (BNI)');

    // 2. BR-33: Student stu-1 cannot retrieve stu-2's application (app-105)
    const otherStudentRecord = repo.getStudentApplicationById(
      'jat-batch-1',
      'stu-1',
      'app-105'
    );
    expect(otherStudentRecord).toBeUndefined();

    // 3. BR-33: Student stu-1 cannot delete stu-2's application
    expect(() =>
      repo.deleteStudentApplication('jat-batch-1', 'stu-1', 'app-105', true)
    ).toThrow(/BR-33/i);

    // 4. BR-24: Rejecting an application without a rejectionReason must fail
    expect(() =>
      repo.updateApplicationValidationStatus('app-101', {
        validationStatus: 'Rejected',
        rejectionReason: '   ',
      })
    ).toThrow(/Alasan penolakan.*wajib diisi.*BR-24/i);

    // 5. BR-25 & BR-28: Updating validation status records reviewer metadata while preserving recruitmentStage
    const updatedRejected = repo.updateApplicationValidationStatus('app-101', {
      validationStatus: 'Rejected',
      rejectionReason: 'Bukti lamaran buram dan tanggal lamar tidak terbaca.',
      reviewFeedback: 'Unggah kembali tangkapan layar resolusi penuh.',
      reviewedBy: 'Talent Support Reviewer A',
      reviewedAt: '2025-03-11T09:00:00Z',
    });

    expect(updatedRejected.validationStatus).toBe('Rejected');
    expect(updatedRejected.rejectionReason).toBe(
      'Bukti lamaran buram dan tanggal lamar tidak terbaca.'
    );
    expect(updatedRejected.reviewFeedback).toBe(
      'Unggah kembali tangkapan layar resolusi penuh.'
    );
    expect(updatedRejected.reviewedBy).toBe('Talent Support Reviewer A');
    expect(updatedRejected.reviewedAt).toBe('2025-03-11T09:00:00Z');
    expect(updatedRejected.validationSource).toBe(
      'Simulated Human Review (Talent Support)'
    );
    // External recruitment stage ('Applied') is untouched
    expect(updatedRejected.recruitmentStage).toBe('Applied');
  });

  it('displays Approved, Waiting Confirmation, and Rejected consistently across the Student list and detail drawer with explicit mock/simulated labels (BR-22, BR-23, BR-27, BR-37)', async () => {
    const user = userEvent.setup();
    renderStudentBatchDetail('/student/talent-support/jat/jat-batch-1', 'stu-1', '2025-03-10');

    // KPI Summary Card shows consistent counts for stu-1 (2 Approved, 1 Waiting, 1 Rejected)
    expect(screen.getByText('Approved: 2')).toBeInTheDocument();
    expect(screen.getByText('Waiting: 1')).toBeInTheDocument();
    expect(screen.getByText('Rejected: 1')).toBeInTheDocument();

    // 1. Inspect Waiting Confirmation item (Bank Negara Indonesia (BNI) - app-101)
    await user.click(
      screen.getByRole('button', {
        name: /Lihat detail pengajuan Bank Negara Indonesia \(BNI\)/i,
      })
    );

    const dialogWaiting = screen.getByRole('dialog', {
      name: /Bank Negara Indonesia \(BNI\)/i,
    });
    expect(
      within(dialogWaiting).getByLabelText(/Informasi Status Verifikasi/i)
    ).toHaveTextContent(/Status Verifikasi Lamaran/i);
    expect(
      within(dialogWaiting).getByLabelText(/Status Validasi Bukti: Waiting Confirmation/i)
    ).toHaveTextContent(/Belum ada hasil validasi akhir/i);

    await user.click(within(dialogWaiting).getByRole('button', { name: /Tutup Detail/i }));

    // 2. Inspect Approved item (Traveloka Indonesia - app-102)
    await user.click(
      screen.getByRole('button', {
        name: /Lihat detail pengajuan Traveloka Indonesia/i,
      })
    );

    const dialogApproved = screen.getByRole('dialog', {
      name: /Traveloka Indonesia/i,
    });
    expect(
      within(dialogApproved).getByLabelText(/Status Validasi Bukti: Approved/i)
    ).toHaveTextContent(
      /Bukti tangkapan layar terverifikasi lengkap \(Nama Perusahaan, Role, dan Status Submitted terlihat jelas\)\./i
    );
    expect(within(dialogApproved).getByText(/Pengajuan Approved telah dikunci/i)).toBeInTheDocument();

    await user.click(within(dialogApproved).getByRole('button', { name: /Tutup Detail/i }));

    // 3. Inspect Rejected item (Bukalapak - app-104)
    await user.click(
      screen.getByRole('button', {
        name: /Lihat detail pengajuan Bukalapak/i,
      })
    );

    const dialogRejected = screen.getByRole('dialog', {
      name: /Bukalapak/i,
    });
    const rejectedBanner = within(dialogRejected).getByLabelText(
      /Status Validasi Bukti: Rejected/i
    );
    expect(rejectedBanner).toHaveTextContent(
      /Screenshot terpotong dan nama perusahaan tidak terlihat jelas\./i
    );
    expect(rejectedBanner).toHaveTextContent(
      /Mohon unggah ulang screenshot utuh yang menampilkan nama perusahaan Bukalapak/i
    );
  });

  it('distinguishes JAT validation status from external employer recruitment progress (BR-28) and handles missing feedback gracefully', async () => {
    const user = userEvent.setup();

    // Clear optional reviewFeedback on app-103 (GoTo Financial, which is Approved in JAT but 'Rejected by Employer' in recruitment)
    batchRepository.updateApplicationValidationStatus('app-103', {
      validationStatus: 'Approved',
      reviewFeedback: '',
    });

    renderStudentBatchDetail('/student/talent-support/jat/jat-batch-1', 'stu-1', '2025-03-10');

    // In the table, GoTo Financial shows 'Rejected by Employer' as external recruitment stage AND 'Approved' as JAT validation status
    expect(screen.getByText('Rejected by Employer')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /Lihat detail pengajuan GoTo Financial/i,
      })
    );

    const dialog = screen.getByRole('dialog', {
      name: /GoTo Financial/i,
    });

    // Missing reviewFeedback falls back to clear default message without crashing or inventing AI output
    expect(
      within(dialog).getByLabelText(/Status Validasi Bukti: Approved/i)
    ).toHaveTextContent(
      /Bukti tangkapan layar lamaran telah diverifikasi dan disetujui \(Approved\) untuk perhitungan kuota JAT\./i
    );

    // BR-28 section explicitly shows 'Rejected by Employer (Ditolak Perusahaan)' while JAT status remains 'Approved'
    const recruitmentSection = within(dialog).getByLabelText(
      /Status Tahapan Rekrutmen Perusahaan/i
    );
    expect(recruitmentSection).toHaveTextContent(
      /Rejected by Employer \(Ditolak Perusahaan\)/i
    );
    expect(recruitmentSection).toHaveTextContent(/tidak menggantikan/i);
  });

  it('synchronizes validation status updates immediately across the Student list, open detail drawer, and KPI summary cards (BLG-JAT-025, BLG-JAT-026)', async () => {
    const user = userEvent.setup();
    renderStudentBatchDetail('/student/talent-support/jat/jat-batch-1', 'stu-1', '2025-03-10');

    // Open detail drawer for BNI (app-101, currently Waiting Confirmation)
    await user.click(
      screen.getByRole('button', {
        name: /Lihat detail pengajuan Bank Negara Indonesia \(BNI\)/i,
      })
    );

    const dialog = screen.getByRole('dialog', {
      name: /Bank Negara Indonesia \(BNI\)/i,
    });
    expect(
      within(dialog).getByLabelText(/Status Validasi Bukti: Waiting Confirmation/i)
    ).toBeInTheDocument();

    // Simulate Admin reviewing app-101 and changing status to Rejected with reason
    act(() => {
      batchRepository.updateApplicationValidationStatus('app-101', {
        validationStatus: 'Rejected',
        rejectionReason: 'URL lowongan tidak sesuai dengan screenshot BNI yang diunggah.',
        reviewFeedback: 'Pastikan tautan lowongan dan bukti screenshot berasal dari lamaran yang sama.',
        reviewedBy: 'Admin Dibimbing (Talent Support)',
      });
    });

    // Both the open detail drawer and the underlying page KPI/table synchronize immediately
    expect(
      within(dialog).getByLabelText(/Status Validasi Bukti: Rejected/i)
    ).toHaveTextContent(/URL lowongan tidak sesuai dengan screenshot BNI yang diunggah\./i);
    expect(screen.getByText('Waiting: 0')).toBeInTheDocument();
    expect(screen.getByText('Rejected: 2')).toBeInTheDocument();

    // Now simulate Admin approving app-101 after re-verification
    act(() => {
      batchRepository.updateApplicationValidationStatus('app-101', {
        validationStatus: 'Approved',
        reviewFeedback: 'Bukti lamaran BNI telah terverifikasi valid.',
        reviewedBy: 'Admin Dibimbing (Talent Support)',
      });
    });

    expect(
      within(dialog).getByLabelText(/Status Validasi Bukti: Approved/i)
    ).toHaveTextContent(/Bukti lamaran BNI telah terverifikasi valid\./i);
    expect(screen.getByText('Approved: 3')).toBeInTheDocument();
    expect(screen.getByText('Rejected: 1')).toBeInTheDocument();
  });

  it('requires explicit confirmation before deleting an unapproved submission and preserves the record on cancel (Stitch acd13109)', async () => {
    const user = userEvent.setup();
    renderStudentBatchDetail('/student/talent-support/jat/jat-batch-1', 'stu-1', '2025-03-10');

    // Click Hapus on BNI (Waiting Confirmation)
    await user.click(
      screen.getByRole('button', {
        name: /Hapus pengajuan Bank Negara Indonesia \(BNI\)/i,
      })
    );

    const deleteModal = screen.getByRole('dialog', {
      name: /Hapus Bukti Pengajuan Lamaran\?/i,
    });
    expect(deleteModal).toBeInTheDocument();

    // Cancel preserves the submission
    await user.click(within(deleteModal).getByRole('button', { name: /Batal/i }));
    expect(screen.getByText('Bank Negara Indonesia (BNI)')).toBeInTheDocument();

    // Open again and confirm deletion
    await user.click(
      screen.getByRole('button', {
        name: /Hapus pengajuan Bank Negara Indonesia \(BNI\)/i,
      })
    );
    const confirmModal = screen.getByRole('dialog', {
      name: /Hapus Bukti Pengajuan Lamaran\?/i,
    });
    await user.click(
      within(confirmModal).getByRole('button', { name: /Ya, Hapus Bukti Lamaran/i })
    );

    expect(screen.queryByText('Bank Negara Indonesia (BNI)')).not.toBeInTheDocument();
    expect(screen.getByText('Waiting: 0')).toBeInTheDocument();
  });
});
