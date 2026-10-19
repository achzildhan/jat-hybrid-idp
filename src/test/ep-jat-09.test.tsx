import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { batchRepository } from '../services/batchRepository';

function renderStudentAppliedJobsRoute(
  initialEntry = '/admin/jat/batches/jat-batch-1/students/stu-1',
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes initialStudentId="stu-1" initialReferenceDate="2025-03-10" />
    </MemoryRouter>,
  );
}

describe('EP-JAT-09 — Applied Jobs Management: Table, Single/Combined Filters, Reset & Sync (BLG-JAT-031..034)', () => {
  beforeEach(() => {
    batchRepository.resetToDefault();
  });

  it('displays all student applications with no filters, dynamic counters, and distinct JAT Validation Status vs Recruitment Progress (BR-28)', () => {
    renderStudentAppliedJobsRoute();

    expect(
      screen.getByRole('heading', { name: /Applied Jobs \(4\)/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('4 / 4 Data');
    expect(screen.getByTestId('applied-jobs-footer-count')).toHaveTextContent(
      'Menampilkan 4 dari 4 data lamaran',
    );

    // Verify all 4 initial application records for Marvin McKinney (stu-1)
    expect(screen.getByText('Bank Negara Indonesia (BNI)')).toBeInTheDocument();
    expect(screen.getByText('Traveloka Indonesia')).toBeInTheDocument();
    expect(screen.getByText('GoTo Financial')).toBeInTheDocument();
    expect(screen.getByText('Bukalapak')).toBeInTheDocument();

    // Verify BR-28 separation between recruitment stage and JAT validation status
    expect(screen.getByTestId('applied-job-recruitment-status-app-102')).toHaveTextContent(
      'User Interview',
    );
    expect(screen.getByTestId('applied-job-recruitment-status-app-103')).toHaveTextContent(
      'Rejected by Employer',
    );
    const app103Row = screen.getByTestId('applied-job-row-app-103');
    expect(within(app103Row).getByText('Approved')).toBeInTheDocument();
  });

  it('supports filtering by each individual filter dimension: Phase, Date Range, and Status Validasi JAT (BR-31)', async () => {
    const user = userEvent.setup();
    renderStudentAppliedJobsRoute();

    // 1. Filter by Phase = Phase 1 (4 records)
    await user.click(screen.getByRole('button', { name: 'Filter Applied Jobs' }));
    const popover = screen.getByRole('dialog', { name: 'Panel Filter Applied Jobs' });
    await user.selectOptions(within(popover).getByLabelText('Filter Phase'), '1');
    await user.click(within(popover).getByRole('button', { name: 'Terapkan Filter' }));

    expect(screen.getByTestId('active-filter-count-badge')).toHaveTextContent('1');
    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('4 / 4 Data');

    // Filter by Phase = Phase 2 (0 records -> empty state)
    await user.click(screen.getByRole('button', { name: 'Filter Applied Jobs' }));
    const popoverPhase2 = screen.getByRole('dialog', { name: 'Panel Filter Applied Jobs' });
    await user.selectOptions(within(popoverPhase2).getByLabelText('Filter Phase'), '2');
    await user.click(within(popoverPhase2).getByRole('button', { name: 'Terapkan Filter' }));

    expect(screen.getByText('Belum Ada Data Lamaran yang Cocok')).toBeInTheDocument();
    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('0 / 4 Data');

    // Reset before testing Date Range filter
    await user.click(screen.getByRole('button', { name: 'Reset semua filter Applied Jobs' }));
    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('4 / 4 Data');

    // 2. Filter by Date Range = Date Range 2 (1 record: Bukalapak)
    await user.click(screen.getByRole('button', { name: 'Filter Applied Jobs' }));
    const popoverDateRange = screen.getByRole('dialog', { name: 'Panel Filter Applied Jobs' });
    await user.selectOptions(
      within(popoverDateRange).getByLabelText('Filter Date Range'),
      'Date Range 2',
    );
    await user.click(within(popoverDateRange).getByRole('button', { name: 'Terapkan Filter' }));

    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('1 / 4 Data');
    expect(screen.getByText('Bukalapak')).toBeInTheDocument();
    expect(screen.queryByText('Traveloka Indonesia')).not.toBeInTheDocument();

    // Reset before testing Status filter
    await user.click(screen.getByRole('button', { name: 'Reset semua filter Applied Jobs' }));

    // 3. Filter by Status Validasi JAT = Waiting Confirmation (1 record: Bank Negara Indonesia (BNI))
    await user.click(screen.getByRole('button', { name: 'Filter Applied Jobs' }));
    const popoverStatus = screen.getByRole('dialog', { name: 'Panel Filter Applied Jobs' });
    await user.selectOptions(
      within(popoverStatus).getByLabelText('Filter Status Validasi'),
      'Waiting Confirmation',
    );
    await user.click(within(popoverStatus).getByRole('button', { name: 'Terapkan Filter' }));

    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('1 / 4 Data');
    expect(screen.getByText('Bank Negara Indonesia (BNI)')).toBeInTheDocument();
    expect(screen.queryByText('GoTo Financial')).not.toBeInTheDocument();
  });

  it('supports combined filters (Phase + Date Range + Status + Search) and case-insensitive search queries', async () => {
    const user = userEvent.setup();
    renderStudentAppliedJobsRoute();

    // Apply combined filter: Phase 1 + Date Range 1 + Approved (should match Traveloka Indonesia & GoTo Financial)
    await user.click(screen.getByRole('button', { name: 'Filter Applied Jobs' }));
    const popover = screen.getByRole('dialog', { name: 'Panel Filter Applied Jobs' });
    await user.selectOptions(within(popover).getByLabelText('Filter Phase'), '1');
    await user.selectOptions(within(popover).getByLabelText('Filter Date Range'), 'Date Range 1');
    await user.selectOptions(within(popover).getByLabelText('Filter Status Validasi'), 'Approved');
    await user.click(within(popover).getByRole('button', { name: 'Terapkan Filter' }));

    expect(screen.getByTestId('active-filter-count-badge')).toHaveTextContent('3');
    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('2 / 4 Data');
    expect(screen.getByText('Traveloka Indonesia')).toBeInTheDocument();
    expect(screen.getByText('GoTo Financial')).toBeInTheDocument();
    expect(screen.queryByText('Bank Negara Indonesia (BNI)')).not.toBeInTheDocument();
    expect(screen.queryByText('Bukalapak')).not.toBeInTheDocument();

    // Combine with case-insensitive search query "tRaVeLoKa"
    const searchInput = screen.getByLabelText('Cari company atau role lamaran');
    await user.type(searchInput, 'tRaVeLoKa');

    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('1 / 4 Data');
    expect(screen.getByText('Traveloka Indonesia')).toBeInTheDocument();
    expect(screen.queryByText('GoTo Financial')).not.toBeInTheDocument();

    // Reset all filters & search via Reset Filter button
    await user.click(screen.getByRole('button', { name: 'Reset semua filter Applied Jobs' }));
    expect(searchInput).toHaveValue('');
    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('4 / 4 Data');
  });

  it('distinguishes empty state caused by active filters (with recovery button) vs student with zero submitted applications', async () => {
    const user = userEvent.setup();
    const { unmount } = renderStudentAppliedJobsRoute(
      '/admin/jat/batches/jat-batch-1/students/stu-1',
    );

    const searchInput = screen.getByLabelText('Cari company atau role lamaran');
    await user.type(searchInput, 'Perusahaan Tidak Terdaftar XYZ');

    expect(screen.getByText('Belum Ada Data Lamaran yang Cocok')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Tidak ada data lamaran yang sesuai dengan kombinasi pencarian atau filter yang dipilih.',
      ),
    ).toBeInTheDocument();

    // Click recovery Reset Filter button inside empty state
    await user.click(screen.getByTestId('empty-state-reset-filter-btn'));
    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('4 / 4 Data');

    unmount();

    // Enroll stu-6 (Leslie Alexander) who has 0 submitted applications and render her Student Detail view
    batchRepository.addParticipantsToBatch('jat-batch-1', ['stu-6']);
    renderStudentAppliedJobsRoute('/admin/jat/batches/jat-batch-1/students/stu-6');
    expect(
      screen.getByText('Mahasiswa ini belum mengunggah bukti lamaran kerja pada batch ini.'),
    ).toBeInTheDocument();
  });

  it('keeps table records and status filters synchronized after Student submission and Admin HITL review', async () => {
    const user = userEvent.setup();
    renderStudentAppliedJobsRoute();

    // Filter to Waiting Confirmation (initially 1 record: app-101 Bank Negara Indonesia (BNI))
    await user.click(screen.getByRole('button', { name: 'Filter Applied Jobs' }));
    const popover = screen.getByRole('dialog', { name: 'Panel Filter Applied Jobs' });
    await user.selectOptions(
      within(popover).getByLabelText('Filter Status Validasi'),
      'Waiting Confirmation',
    );
    await user.click(within(popover).getByRole('button', { name: 'Terapkan Filter' }));

    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('1 / 4 Data');
    expect(screen.getByText('Bank Negara Indonesia (BNI)')).toBeInTheDocument();

    // 1. Simulate a new Student submission that lands in Waiting Confirmation (inside active Date Range 1)
    act(() => {
      batchRepository.submitStudentApplication(
        {
          batchId: 'jat-batch-1',
          studentId: 'stu-1',
          dateApplied: '2025-03-08',
          role: 'Data Analyst',
          company: 'PT Telkom Indonesia',
          location: 'Bandung',
          position: 'Full-time',
          jobLevel: 'Junior Level',
          workSystem: 'Hybrid',
          yearsOfExperience: '0-1 Tahun',
          vacancyUrl: 'https://careers.example.com/telkom-da',
          evidenceFile: {
            name: 'telkom_cropped_proof.png',
            type: 'image/png',
            size: 245000,
          },
        },
        '2025-03-10',
      );
    });

    // Wait for reactive repository update event to refresh table
    expect(await screen.findByText('PT Telkom Indonesia')).toBeInTheDocument();
    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('2 / 5 Data');

    // 2. Inspect & Approve app-101 (Bank Negara Indonesia (BNI)) via HITL Inspector modal
    await user.click(screen.getByTestId('student-detail-inspect-btn-app-101'));
    const modal = screen.getByRole('dialog', { name: /Detail Konfirmasi JAT/i });
    await user.click(
      within(modal).getByRole('button', { name: /Iya \(Valid — Setujui\)/i }),
    );
    await user.click(within(modal).getByRole('button', { name: /Konfirmasi JAT/i }));
    const confirmDialog = screen.getByRole('dialog', {
      name: /Dialog Konfirmasi Keputusan Review/i,
    });
    await user.click(within(confirmDialog).getByRole('button', { name: /Ya, Setujui/i }));

    // Since filter is still Waiting Confirmation, BNI leaves the filtered view (now 1 / 5 Data)
    expect(screen.queryByText('Bank Negara Indonesia (BNI)')).not.toBeInTheDocument();
    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('1 / 5 Data');

    // Switch filter to Approved -> BNI is now listed under Approved (3 / 5 Data)
    await user.click(screen.getByRole('button', { name: 'Filter Applied Jobs' }));
    const popoverApproved = screen.getByRole('dialog', { name: 'Panel Filter Applied Jobs' });
    await user.selectOptions(
      within(popoverApproved).getByLabelText('Filter Status Validasi'),
      'Approved',
    );
    await user.click(within(popoverApproved).getByRole('button', { name: 'Terapkan Filter' }));

    expect(screen.getByTestId('applied-jobs-total-badge')).toHaveTextContent('3 / 5 Data');
    expect(screen.getByText('Bank Negara Indonesia (BNI)')).toBeInTheDocument();
  });
});
