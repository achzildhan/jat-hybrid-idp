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
import {
  deduplicateDateRanges,
  evaluateBatchAccess,
  evaluatePeriodWindowStatus,
  evaluatePhaseAccess,
} from '../services/batchValidator';

describe('EP-JAT-03 Domain & Repository Tests: Period Boundaries, Deduplication & Admin-Student Date Consistency (BLG-JAT-011, BLG-JAT-012)', () => {
  let repo: MockBatchRepository;

  beforeEach(() => {
    repo = new MockBatchRepository(
      INITIAL_MOCK_BATCHES,
      MOCK_STUDENT_DIRECTORY,
      INITIAL_MOCK_APPLICATIONS
    );
  });

  it('returns empty batch list for a Student with no assigned batch and 1 batch for an enrolled Student', () => {
    // stu-6 (Leslie Alexander) has no assigned batch initially
    const noBatches = repo.listBatchesForStudent('stu-6');
    expect(noBatches).toHaveLength(0);

    // stu-1 (Marvin McKinney) is enrolled in JAT Batch 1
    const oneBatch = repo.listBatchesForStudent('stu-1');
    expect(oneBatch).toHaveLength(1);
    expect(oneBatch[0].id).toBe('jat-batch-1');
  });

  it('evaluates dates before, during, after a range, and exact start/end boundaries inclusively (BR-03, BR-07, BLG-JAT-012)', () => {
    const startDate = '2025-03-01';
    const endDate = '2025-03-15';

    // Before startDate -> Upcoming
    expect(evaluatePeriodWindowStatus(startDate, endDate, '2025-02-28')).toBe('Upcoming');

    // Exact start boundary -> Active (inclusive)
    expect(evaluatePeriodWindowStatus(startDate, endDate, '2025-03-01')).toBe('Active');

    // During range -> Active
    expect(evaluatePeriodWindowStatus(startDate, endDate, '2025-03-10')).toBe('Active');

    // Exact end boundary -> Active (inclusive)
    expect(evaluatePeriodWindowStatus(startDate, endDate, '2025-03-15')).toBe('Active');

    // After endDate -> Expired
    expect(evaluatePeriodWindowStatus(startDate, endDate, '2025-03-16')).toBe('Expired');

    // Invalid range where startDate > endDate (BR-03) -> Inactive
    expect(evaluatePeriodWindowStatus('2025-03-20', '2025-03-10', '2025-03-15')).toBe(
      'Inactive'
    );
  });

  it('supports multiple phases, optional Phase 2 (BR-04), and multiple date ranges without duplicates (JAT-BL-14)', () => {
    // Batch 1 has Phase 1 (2 ranges) and Phase 2 enabled (2 ranges)
    const batch1 = repo.getBatchById('jat-batch-1')!;
    const batch1AccessOnMar15 = evaluateBatchAccess(batch1, '2025-03-15');
    expect(batch1AccessOnMar15.canSubmitApplication).toBe(true);
    expect(batch1AccessOnMar15.activePhaseNumber).toBe(1);
    expect(batch1AccessOnMar15.phase1Access.dateRanges).toHaveLength(2);
    expect(batch1AccessOnMar15.phase2Access.enabled).toBe(true);
    expect(batch1AccessOnMar15.phase2Access.dateRanges).toHaveLength(2);

    // Batch 3 has Phase 1 only and Phase 2 disabled (BR-04)
    const batch3 = repo.getBatchById('jat-batch-3')!;
    const batch3Access = evaluateBatchAccess(batch3, '2025-04-01');
    expect(batch3Access.phase1Access.enabled).toBe(true);
    expect(batch3Access.phase1Access.windowStatus).toBe('Active');
    expect(batch3Access.phase2Access.enabled).toBe(false);
    expect(batch3Access.phase2Access.windowStatus).toBe('Inactive');
    expect(batch3Access.phase2Access.dateRanges).toHaveLength(0);

    // Deduplicate identical date ranges (JAT-BL-14)
    const duplicatedRanges = [
      ...batch1.phase1.dateRanges,
      { ...batch1.phase1.dateRanges[0], id: 'dup-range-id', label: 'Duplicate Range' },
    ];
    const deduped = deduplicateDateRanges(duplicatedRanges);
    expect(deduped).toHaveLength(2);
    const phaseEval = evaluatePhaseAccess(
      { ...batch1.phase1, dateRanges: duplicatedRanges },
      '2025-03-10'
    );
    expect(phaseEval.dateRanges).toHaveLength(2);
  });

  it('maintains consistent start/end dates and targets between Admin updates and Student views (BR-06, JAT-BL-14)', () => {
    const batchBefore = repo.getBatchById('jat-batch-1')!;
    // Admin updates Phase 1 Date Range 1 from 2025-03-01..2025-03-15 to 2025-03-05..2025-03-18
    // and increases Junior Level target from 5 to 8
    const updatedPhase1 = structuredClone(batchBefore.phase1);
    updatedPhase1.dateRanges[0].startDate = '2025-03-05';
    updatedPhase1.dateRanges[0].endDate = '2025-03-18';
    updatedPhase1.dateRanges[0].targets[0].targetCount = 8;

    repo.updateBatch('jat-batch-1', {
      name: batchBefore.name,
      affiliatedCohortIds: batchBefore.affiliatedCohorts.map((c) => c.id),
      phase1: updatedPhase1,
      phase2: batchBefore.phase2,
    });

    // Student view immediately reflects the exact Admin-configured dates and targets
    const studentViewOnMar03 = repo.getStudentBatchView(
      'jat-batch-1',
      'stu-1',
      '2025-03-03'
    )!;
    expect(studentViewOnMar03.phase1.startDate).toBe('2025-03-05');
    expect(studentViewOnMar03.phase1.dateRanges[0].startDate).toBe('2025-03-05');
    expect(studentViewOnMar03.phase1.dateRanges[0].endDate).toBe('2025-03-18');
    // Phase 1 total target updated from 13 to 16 (8 + 2 + 3 + 3)
    expect(studentViewOnMar03.phase1.totalTargetCount).toBe(16);
    // On 2025-03-03 (now before the updated startDate 2025-03-05), submission is locked!
    expect(studentViewOnMar03.access.canSubmitApplication).toBe(false);
    expect(studentViewOnMar03.access.periodStatus).toBe('Upcoming');
  });
});

describe('EP-JAT-03 Student UI Integration Tests: Batch List, Empty States, Detail & Period Access Gating (BLG-JAT-009, BLG-JAT-010, BLG-JAT-012)', () => {
  beforeEach(() => {
    batchRepository.resetToDefault();
  });

  it('shows a useful empty state when the selected Student has no assigned batch and recovers when switching to an enrolled Student', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/student/talent-support/jat']}>
        <AppRoutes initialStudentId="stu-6" initialReferenceDate="2025-03-10" />
      </MemoryRouter>
    );

    // Leslie Alexander (stu-6) has no assigned batch -> Empty state rendered
    expect(
      screen.getByRole('heading', { name: /Belum Ada Batch JAT yang Ditugaskan/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/leslie\.alexander@example\.com/i)).toBeInTheDocument();

    // Switch to enrolled student Marvin McKinney (stu-1) via quick recovery button
    await user.click(
      screen.getByRole('button', {
        name: /Lihat Contoh Student Terdaftar \(Marvin McKinney\)/i,
      })
    );

    // JAT Batch 1 is now displayed in the Student Batch List table with exact Admin dates
    expect(screen.getByText('JAT Batch 1')).toBeInTheDocument();
    expect(screen.getByText(/1 Maret 2025 – 31 Maret 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Juni 2025 – 30 Juni 2025/i)).toBeInTheDocument();
  });

  it('displays Phase 1, Phase 2, date ranges, job-level targets, and enforces period boundary access on "+ Add Proof of Application"', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/student/talent-support/jat/jat-batch-1']}>
        <AppRoutes initialStudentId="stu-1" initialReferenceDate="2025-03-01" />
      </MemoryRouter>
    );

    // Exact start boundary (2025-03-01): "+ Add Proof of Application" is ENABLED
    const submitBtn = screen.getByRole('button', { name: /\+ Add Proof of Application/i });
    expect(submitBtn).not.toBeDisabled();

    // Displays Phase 1 and Phase 2 sections with configured ranges and job-level targets
    const phase1Section = screen.getByRole('region', { name: 'Phase 1' });
    expect(within(phase1Section).getByText('Date Range 1')).toBeInTheDocument();
    expect(within(phase1Section).getByText('Date Range 2')).toBeInTheDocument();
    expect(
      within(phase1Section).getByText(/1 Maret 2025 – 15 Maret 2025/i)
    ).toBeInTheDocument();
    expect(
      within(phase1Section).getByText(/16 Maret 2025 – 31 Maret 2025/i)
    ).toBeInTheDocument();
    expect(within(phase1Section).getAllByText('Junior Level').length).toBeGreaterThan(0);
    expect(within(phase1Section).getByText('Senior Level')).toBeInTheDocument();
    expect(within(phase1Section).getByText('Mid Level')).toBeInTheDocument();

    // Switch reference date to BEFORE period (15 Feb 2025) -> button becomes DISABLED (Upcoming)
    await user.click(screen.getByRole('button', { name: /Sebelum Periode \(15 Feb\)/i }));
    expect(submitBtn).toBeDisabled();
    expect(
      screen.getByText(/Periode pelaporan belum dimulai/i)
    ).toBeInTheDocument();

    // Switch reference date to exact END boundary of Date Range 1 (15 Mar 2025) -> ENABLED
    await user.click(screen.getByRole('button', { name: /Batas End \(15 Mar\)/i }));
    expect(submitBtn).not.toBeDisabled();

    // Switch reference date to AFTER all periods (15 Jul 2025) -> button becomes DISABLED (Expired)
    await user.click(screen.getByRole('button', { name: /Setelah Periode \(15 Jul\)/i }));
    expect(submitBtn).toBeDisabled();
    expect(
      screen.getByText(/Periode pelaporan telah berakhir/i)
    ).toBeInTheDocument();
  });

  it('renders optional Phase 2 disabled state cleanly when a Student views a Phase-1-only batch (BR-04)', () => {
    // Enroll stu-1 into jat-batch-3 (Phase 1 Only, Phase 2 disabled)
    batchRepository.addParticipantsToBatch('jat-batch-3', ['stu-1']);

    render(
      <MemoryRouter initialEntries={['/student/talent-support/jat/jat-batch-3']}>
        <AppRoutes initialStudentId="stu-1" initialReferenceDate="2025-04-10" />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /JAT Batch 3 \(Phase 1 Only\)/i })
    ).toBeInTheDocument();
    const phase2Section = screen.getByRole('region', { name: 'Phase 2' });
    expect(
      within(phase2Section).getByText(/Phase 2 Tidak Diaktifkan \(Opsional\)/i)
    ).toBeInTheDocument();
  });
});
