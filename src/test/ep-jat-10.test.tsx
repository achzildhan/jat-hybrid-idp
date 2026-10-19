import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import { batchRepository } from '../services/batchRepository';
import { validateBatchInput } from '../services/batchValidator';
import {
  computeBatchMonitoringSummary,
  evaluateTargetAchievementState,
  PROGRESS_CALCULATION_POLICY,
} from '../services/progressCalculator';

describe('EP-JAT-10 — Progress Monitoring: Sinkronisasi target, progres dan monitoring', () => {
  beforeEach(() => {
    batchRepository.resetToDefault();
  });

  it('calculates progress accurately from both empty and populated datasets and exposes TBD-CALC-01 policy (BLG-JAT-035, BLG-JAT-037)', () => {
    // 1. Populated dataset (jat-batch-1)
    const populatedSummary = batchRepository.getBatchMonitoringSummary('jat-batch-1')!;
    expect(populatedSummary.enrolledParticipantsCount).toBe(3);
    expect(populatedSummary.phase1TargetPerStudent).toBe(13); // (5 + 2) + (3 + 3)
    expect(populatedSummary.phase2TargetPerStudent).toBe(10); // 5 + 5
    expect(populatedSummary.totalTargetPerStudent).toBe(23);
    expect(populatedSummary.cohortTotalCapacity).toBe(69); // 3 * 23
    expect(populatedSummary.cohortTotalCompleted).toBeGreaterThan(0);
    expect(populatedSummary.policyMetadata.decisionId).toBe('TBD-CALC-01');
    expect(PROGRESS_CALCULATION_POLICY.requiresProductOwnerConfirmation).toBe(true);

    // 2. Empty dataset (jat-batch-3 has 0 participants and 0 submissions)
    const emptyBatch = batchRepository.getBatchById('jat-batch-3')!;
    const emptySummary = computeBatchMonitoringSummary(emptyBatch, []);
    expect(emptySummary.enrolledParticipantsCount).toBe(0);
    expect(emptySummary.cohortTotalCapacity).toBe(0);
    expect(emptySummary.cohortTotalCompleted).toBe(0);
    expect(emptySummary.cohortCompletionPercentage).toBe(0);
    expect(emptySummary.validationBreakdown.totalSubmissions).toBe(0);

    // 3. Target achievement states (Achieved, In Progress, Not Achieved, Not Started)
    expect(evaluateTargetAchievementState(5, 5, 'Active')).toEqual({
      achievementCode: 'Achieved',
      achievementLabelId: 'Tercapai',
    });
    expect(evaluateTargetAchievementState(2, 5, 'Active')).toEqual({
      achievementCode: 'In Progress',
      achievementLabelId: 'Dalam Progres',
    });
    expect(evaluateTargetAchievementState(2, 5, 'Expired')).toEqual({
      achievementCode: 'Not Achieved',
      achievementLabelId: 'Tidak Tercapai',
    });
    expect(evaluateTargetAchievementState(0, 5, 'Upcoming')).toEqual({
      achievementCode: 'Not Started',
      achievementLabelId: 'Belum Dimulai',
    });
  });

  it('keeps external employer recruitment progress strictly separate from JAT validation status (BR-28)', () => {
    render(
      <MemoryRouter initialEntries={['/admin/jat/batches/jat-batch-1']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId('batch-monitoring-summary-section')).toBeInTheDocument();
    expect(screen.getByTestId('monitoring-card-validation')).toBeInTheDocument();
    expect(screen.getByTestId('monitoring-card-recruitment-pipeline')).toBeInTheDocument();

    // Verify JAT validation counts vs external employer recruitment stages on jat-batch-1
    const summary = batchRepository.getBatchMonitoringSummary('jat-batch-1')!;
    expect(screen.getByTestId('monitoring-validation-approved')).toHaveTextContent(
      String(summary.validationBreakdown.Approved)
    );
    expect(screen.getByTestId('monitoring-validation-waiting')).toHaveTextContent(
      String(summary.validationBreakdown['Waiting Confirmation'])
    );
    expect(screen.getByTestId('monitoring-validation-rejected')).toHaveTextContent(
      String(summary.validationBreakdown.Rejected)
    );

    expect(screen.getByTestId('monitoring-recruitment-hr')).toHaveTextContent(
      String(summary.recruitmentPipelineBreakdown.byStage['HR Screening'])
    );
    expect(screen.getByTestId('monitoring-recruitment-interview')).toHaveTextContent(
      String(summary.recruitmentPipelineBreakdown.byStage['User Interview'])
    );
    expect(screen.getByTestId('monitoring-recruitment-employer-rejected')).toHaveTextContent(
      String(summary.recruitmentPipelineBreakdown.byStage['Rejected by Employer'])
    );
  });

  it('updates derived progress when participants are added/removed or when new submissions and status changes occur (BR-09, BR-29, BLG-JAT-037)', () => {
    const beforeAdd = batchRepository.getBatchMonitoringSummary('jat-batch-1')!;
    expect(beforeAdd.enrolledParticipantsCount).toBe(3);
    expect(beforeAdd.cohortTotalCapacity).toBe(69);

    // 1. Add a participant (stu-6) -> capacity increases from 69 to 92 (4 * 23)
    batchRepository.addParticipantsToBatch('jat-batch-1', ['stu-6']);
    const afterAdd = batchRepository.getBatchMonitoringSummary('jat-batch-1')!;
    expect(afterAdd.enrolledParticipantsCount).toBe(4);
    expect(afterAdd.cohortTotalCapacity).toBe(92);

    // 2. Remove the participant -> capacity returns to 69
    batchRepository.removeParticipantFromBatch('jat-batch-1', 'stu-6', true);
    const afterRemove = batchRepository.getBatchMonitoringSummary('jat-batch-1')!;
    expect(afterRemove.enrolledParticipantsCount).toBe(3);
    expect(afterRemove.cohortTotalCapacity).toBe(69);

    // 3. Student stu-2 submits a new valid application -> starts as Waiting Confirmation
    const std2Before = batchRepository.getParticipantInBatch('jat-batch-1', 'stu-2')!;
    expect(std2Before.phase1CompletedCount).toBe(5);

    const newRecord = batchRepository.submitStudentApplication(
      {
        batchId: 'jat-batch-1',
        studentId: 'stu-2',
        dateApplied: '2025-03-08',
        role: 'Product Designer',
        company: 'PT GoTo Gojek Tokopedia Tbk',
        location: 'Jakarta Selatan',
        position: 'Full-time',
        jobLevel: 'Junior Level',
        workSystem: 'Hybrid',
        yearsOfExperience: '1 Tahun',
        vacancyUrl: 'https://careers.gotocompany.com/jobs/product-designer',
        evidenceFile: {
          name: 'bukti-goto-product-designer.png',
          type: 'image/png',
          size: 245000,
        },
      },
      '2025-03-10'
    );
    expect(newRecord.validationStatus).toBe('Waiting Confirmation');

    // Waiting Confirmation does NOT inflate Approved quota yet
    const std2DuringWaiting = batchRepository.getParticipantInBatch('jat-batch-1', 'stu-2')!;
    expect(std2DuringWaiting.phase1CompletedCount).toBe(5);

    // 4. Admin approves the submission via HITL review -> Approved quota increments to 6
    batchRepository.reviewApplicationRequest(newRecord.id, {
      decision: 'Approved',
      actorRole: 'Admin (Talent Support)',
      confirmed: true,
    });

    const std2AfterApproval = batchRepository.getParticipantInBatch('jat-batch-1', 'stu-2')!;
    expect(std2AfterApproval.phase1CompletedCount).toBe(6);
  });

  it('prevents duplicate date ranges and keeps Student-facing dates synchronized with Admin configuration while preserving historical submission validity (BR-06, BR-08, BR-42, JAT-BL-14)', () => {
    const batch = batchRepository.getBatchById('jat-batch-1')!;

    // 1. Validate duplicate date range rejection (JAT-BL-14)
    const duplicateRangeInput = {
      name: batch.name,
      affiliatedCohortIds: batch.affiliatedCohorts.map((c) => c.id),
      phase1: {
        ...batch.phase1,
        dateRanges: [
          ...batch.phase1.dateRanges,
          {
            id: 'dup-range-3',
            label: 'Date Range 3',
            startDate: batch.phase1.dateRanges[0].startDate,
            endDate: batch.phase1.dateRanges[0].endDate,
            targets: [{ id: 't-dup', jobLevel: 'Junior Level' as const, targetCount: 3 }],
          },
        ],
      },
      phase2: batch.phase2,
    };

    const validation = validateBatchInput(
      duplicateRangeInput,
      batchRepository.listBatches(),
      batch.id
    );
    expect(validation.valid).toBe(false);
    expect(validation.errors['phase1.range.2.dates']).toMatch(/duplikat/i);

    // 2. Consequential edit without confirmation throws BR-08 error
    const updatedScheduleInput = {
      name: batch.name,
      affiliatedCohortIds: batch.affiliatedCohorts.map((c) => c.id),
      phase1: {
        ...batch.phase1,
        dateRanges: [
          {
            ...batch.phase1.dateRanges[0],
            startDate: '2025-03-10',
            endDate: '2025-03-15',
            targets: [
              { id: 't-p1-r1-1', jobLevel: 'Junior Level' as const, targetCount: 4 },
              { id: 't-p1-r1-2', jobLevel: 'Senior Level' as const, targetCount: 2 },
            ],
          },
          batch.phase1.dateRanges[1],
        ],
      },
      phase2: batch.phase2,
    };

    expect(() =>
      batchRepository.updateBatch(batch.id, updatedScheduleInput, {
        confirmedConsequentialImpact: false,
      })
    ).toThrow(/BR-08/i);

    // 3. Preview consequential edit impact before applying
    const impact = batchRepository.previewBatchEditImpact(batch.id, updatedScheduleInput)!;
    expect(impact.isConsequential).toBe(true);
    expect(impact.hasTargetChanges).toBe(true);
    expect(impact.hasDateRangeChanges).toBe(true);
    expect(impact.preservedHistoricalSubmissionsCount).toBeGreaterThanOrEqual(1);
    expect(impact.previousPhase1Target).toBe(13);
    expect(impact.nextPhase1Target).toBe(12);

    // 4. Apply consequential edit with confirmation
    batchRepository.updateBatch(batch.id, updatedScheduleInput, {
      confirmedConsequentialImpact: true,
    });

    // 5. Verify Student Portal reflects the updated Admin dates & targets (BR-06, JAT-BL-14)
    const studentView = batchRepository.getStudentBatchView(batch.id, 'stu-1', '2025-03-12');
    expect(studentView?.phase1.dateRanges).toHaveLength(2);
    expect(studentView?.phase1.dateRanges[0].startDate).toBe('2025-03-10');
    expect(studentView?.phase1.dateRanges[0].endDate).toBe('2025-03-15');
    expect(studentView?.phase1.totalTargetCount).toBe(12);

    // 6. Historical applications on 2025-03-04 (app-101) and 2025-03-06 (app-102) retain historical validity window (BR-42)
    const stu1Apps = batchRepository.listStudentApplications(batch.id, 'stu-1');
    const historicalWaitingApp = stu1Apps.find((a) => a.id === 'app-101');
    const historicalApprovedApp = stu1Apps.find((a) => a.id === 'app-102');

    expect(historicalWaitingApp?.dateApplied).toBe('2025-03-04');
    expect(historicalWaitingApp?.validationStatus).toBe('Waiting Confirmation');
    expect(historicalWaitingApp?.submittedDateRangeWindow).toEqual({
      startDate: '2025-03-01',
      endDate: '2025-03-15',
    });

    // Inspection still recognizes app-101 as within its historical configured date range (BR-42)
    const inspection = batchRepository.getAdminApplicationInspectionById('app-101');
    expect(inspection?.isWithinConfiguredDateRange).toBe(true);

    expect(historicalApprovedApp?.dateApplied).toBe('2025-03-06');
    expect(historicalApprovedApp?.validationStatus).toBe('Approved');
    expect(historicalApprovedApp?.submittedDateRangeWindow).toEqual({
      startDate: '2025-03-01',
      endDate: '2025-03-15',
    });
  });

  it('displays consequential impact preview in AdminBatchFormPage confirmation modal before applying target changes (BLG-JAT-037, BR-08)', () => {
    render(
      <MemoryRouter initialEntries={['/admin/jat/batches/jat-batch-1/edit']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const targetInputs = screen.getAllByLabelText(/Job Applied \(Target Lamaran\)/i);
    // Change first target from 5 to 8 (+3 target increase -> total 23 + 3 = 26)
    fireEvent.change(targetInputs[0], { target: { value: '8' } });

    fireEvent.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByTestId('consequential-edit-impact-panel')).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Dampak Perubahan Konsekuensial \(BR-08 & BR-29\)/i)
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: /Ya, Simpan & Aktifkan/i }));

    // After saving, Batch Detail shows updated per-student target (26 Lamaran)
    expect(screen.getByTestId('monitoring-per-student-target')).toHaveTextContent('26 Lamaran');
  });

  it('enforces role-gated Recalculate Progress and reports both No-Op and Updated execution states (BLG-JAT-036, BR-30, BR-43, DSN-TBD-02)', () => {
    render(
      <MemoryRouter initialEntries={['/admin/jat/batches/jat-batch-1']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // 1. Default role is Admin (Talent Support) -> Recalculate Progress button is visible
    const recalcBtn = screen.getByRole('button', { name: /Recalculate Progress/i });
    expect(recalcBtn).toBeInTheDocument();

    // First click when already synchronized -> No-Op state
    fireEvent.click(recalcBtn);
    expect(screen.getByTestId('recalculate-status-banner')).toHaveTextContent(
      /berhasil dihitung ulang oleh Admin/i
    );
    expect(screen.getByTestId('recalculate-execution-mode-badge')).toHaveTextContent(
      /No-Op \(Sinkron\)/i
    );

    // 2. Switch role to Super Admin -> still authorized per DSN-TBD-02
    const roleSelect = screen.getByTestId('recalculate-role-select');
    fireEvent.change(roleSelect, { target: { value: 'Super Admin' } });
    expect(screen.getByRole('button', { name: /Recalculate Progress/i })).toBeInTheDocument();

    // 3. Switch role to Student -> Recalculate Progress button is hidden and restricted notice is shown (BR-30)
    fireEvent.change(roleSelect, { target: { value: 'Student' } });
    expect(screen.queryByRole('button', { name: /Recalculate Progress/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('recalculate-role-restricted-badge')).toBeInTheDocument();

    // Repository also blocks unauthorized role calls directly
    expect(() =>
      batchRepository.recalculateBatchProgressWithReport('jat-batch-1', 'Student')
    ).toThrow(/Akses ditolak \(BR-30/i);
  });
});
