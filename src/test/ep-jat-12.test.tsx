import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import { batchRepository } from '../services/batchRepository';
import {
  SYNTHETIC_FIXTURES,
  runIdpExtractionPipeline,
  validateApplicationEvidence,
} from '../services/idp';
import type { SubmittedApplicationForm } from '../services/idp';

describe('EP-JAT-12 — Quality Assurance: E2E Workflow, Integration & Regression (BLG-JAT-042, BLG-JAT-043, BLG-JAT-044)', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    batchRepository.resetToDefaults();
    batchRepository.setActiveRole('Admin (Talent Support)');
    batchRepository.setActiveStudentId('stu-1');
  });

  describe('BLG-JAT-042: End-to-End Workflow Integration Test', () => {
    it('executes full 9-step E2E journey: Admin Batch Config -> Add Participant -> Student Submit -> IDP Extraction & Validation -> Admin HITL Review -> Sync Progress', async () => {
      // -------------------------------------------------------------
      // STEP 1: Admin creates and configures a new batch
      // -------------------------------------------------------------
      batchRepository.setActiveRole('Admin (Talent Support)');

      const createdBatch = batchRepository.createBatch({
        name: 'JAT Batch 99 QA E2E',
        affiliatedCohortIds: ['cohort-fe-1'],
        phase1: {
          phaseNumber: 1,
          enabled: true,
          dateRanges: [
            {
              id: 'p1-r1-e2e',
              label: 'Phase 1 - Range 1',
              startDate: '2025-03-01',
              endDate: '2025-03-15',
              targets: [
                {
                  id: 't-jr-1',
                  jobLevel: 'Junior Level',
                  targetCount: 5,
                },
              ],
            },
          ],
        },
        phase2: {
          phaseNumber: 2,
          enabled: false,
          dateRanges: [],
        },
      });

      expect(createdBatch.id).toBeDefined();
      expect(createdBatch.name).toBe('JAT Batch 99 QA E2E');
      expect(createdBatch.participants).toHaveLength(0);

      // -------------------------------------------------------------
      // STEP 2: Admin adds a synthetic Student to the batch
      // -------------------------------------------------------------
      const updatedBatch = batchRepository.addParticipantsToBatch(
        createdBatch.id,
        ['stu-1']
      );
      expect(updatedBatch.participants).toHaveLength(1);
      const participant = updatedBatch.participants[0];
      expect(participant.id).toBe('stu-1');
      expect(participant.phase1TargetCount).toBe(5);
      expect(participant.phase1CompletedCount).toBe(0);

      // -------------------------------------------------------------
      // STEP 3: Student context simulated: accesses batch and active phase
      // -------------------------------------------------------------
      batchRepository.setActiveRole('Student');
      batchRepository.setActiveStudentId('stu-1');

      const studentBatches = batchRepository.listBatchesForStudent('stu-1');
      expect(studentBatches.some((b) => b.id === createdBatch.id)).toBe(true);

      const batchView = batchRepository.getStudentBatchView(
        createdBatch.id,
        'stu-1',
        '2025-03-10' // Active date within 2025-03-01 - 2025-03-15
      );
      expect(batchView).toBeDefined();
      expect(batchView!.access.canSubmitApplication).toBe(true);
      expect(batchView!.phase1.windowStatus).toBe('Active');

      // -------------------------------------------------------------
      // STEP 4: Student submits an application with permitted evidence
      // -------------------------------------------------------------
      const submittedApp = batchRepository.submitStudentApplication(
        {
          batchId: createdBatch.id,
          studentId: 'stu-1',
          dateApplied: '2025-03-10',
          role: 'Frontend Engineer',
          company: 'PT Tech Nusantara Indonesia',
          location: 'Jakarta Selatan, Indonesia',
          position: 'Full-time',
          jobLevel: 'Junior Level',
          workSystem: 'Remote / WFH',
          yearsOfExperience: '1-2 tahun',
          vacancyUrl: 'https://jobs.technusantara.id/career/fe-junior-2025',
          evidenceFile: {
            name: 'bukti-lengkap-pt-tech-nusantara.png',
            size: 245760,
            type: 'image/png',
            headerBytes: [0x89, 0x50, 0x4e, 0x47],
          },
        },
        '2025-03-10'
      );

      expect(submittedApp.id).toBeDefined();
      expect(submittedApp.validationStatus).toBe('Waiting Confirmation');
      expect(submittedApp.recruitmentStage).toBe('Applied');

      // -------------------------------------------------------------
      // STEP 5: Hybrid IDP Extraction Pipeline runs (Mock Adapter)
      // -------------------------------------------------------------
      const extractionResult = await runIdpExtractionPipeline({
        fileName: submittedApp.evidenceFileName,
        fileSizeBytes: submittedApp.evidenceFileSize!,
        mimeType: submittedApp.evidenceMimeType!,
        headerBytes: [0x89, 0x50, 0x4e, 0x47],
        fixtureId: 'CLEAR_READABLE',
      });

      expect(extractionResult.success).toBe(true);
      expect(extractionResult.processingMetadata.isMockAdapter).toBe(true);
      expect(extractionResult.processingMetadata.providerDecisionStatus).toBe(
        'BLOCKED_PENDING_DECISION'
      );
      expect(extractionResult.extractedAttributes?.company.value).toBe(
        'PT Tech Nusantara Indonesia'
      );
      expect(extractionResult.extractedAttributes?.role.value).toBe(
        'Frontend Engineer'
      );

      // -------------------------------------------------------------
      // STEP 6: Hybrid IDP Validation runs (Deterministic + Semantic)
      // -------------------------------------------------------------
      const submissionForm: SubmittedApplicationForm = {
        applicationId: submittedApp.id,
        batchId: submittedApp.batchId,
        studentId: submittedApp.studentId,
        dateApplied: submittedApp.dateApplied,
        role: submittedApp.role,
        company: submittedApp.company,
        location: submittedApp.location,
        position: submittedApp.position,
        jobLevel: submittedApp.jobLevel,
        workSystem: submittedApp.workSystem,
        yearsOfExperience: submittedApp.yearsOfExperience,
        vacancyUrl: submittedApp.vacancyUrl,
        evidenceFileName: submittedApp.evidenceFileName,
        referenceDate: '2025-03-10',
        activeDateRangeWindow: {
          startDate: '2025-03-01',
          endDate: '2025-03-15',
          label: 'Phase 1 - Range 1',
        },
      };

      const validationResult = await validateApplicationEvidence(
        submissionForm,
        extractionResult
      );

      expect(validationResult.deterministicResult.passed).toBe(true);
      expect(validationResult.overallComplianceScore).toBeGreaterThanOrEqual(90);
      expect(validationResult.validationStatus).toBe('Approved');

      // -------------------------------------------------------------
      // STEP 7: Student views validation status & feedback
      // -------------------------------------------------------------
      const studentApps = batchRepository.listStudentApplications(
        createdBatch.id,
        'stu-1'
      );
      expect(studentApps).toHaveLength(1);
      const studentRecord = studentApps[0];
      expect(studentRecord.validationStatus).toBe('Waiting Confirmation'); // Pending Admin review

      // -------------------------------------------------------------
      // STEP 8: Admin reviews Waiting Confirmation submission in HITL queue
      // -------------------------------------------------------------
      batchRepository.setActiveRole('Admin (Talent Support)');

      const queue = batchRepository.listWaitingConfirmationRequests();
      const inQueue = queue.find((q) => q.application.id === submittedApp.id);
      expect(inQueue).toBeDefined();

      // Admin opens inspection checklist with all 7 BR-39 attributes
      const inspection = batchRepository.getAdminApplicationInspectionById(
        submittedApp.id
      );
      expect(inspection).toBeDefined();
      expect(inspection!.attributeChecklist).toHaveLength(7);
      expect(inspection!.isWithinConfiguredDateRange).toBe(true);

      // Admin confirms and Approves the submission
      const reviewedRecord = batchRepository.updateApplicationValidationStatus(
        submittedApp.id,
        {
          validationStatus: 'Approved',
          reviewFeedback: 'Bukti lamaran tervalidasi dan sesuai.',
          reviewedBy: 'Talent Support Lead',
          actorRole: 'Admin (Talent Support)',
        }
      );

      expect(reviewedRecord.validationStatus).toBe('Approved');
      expect(reviewedRecord.reviewHistory).toHaveLength(1);

      // Submission leaves the Waiting Confirmation queue (BR-32)
      const queueAfter = batchRepository.listWaitingConfirmationRequests();
      expect(queueAfter.some((q) => q.application.id === submittedApp.id)).toBe(false);

      // -------------------------------------------------------------
      // STEP 9: Applied Jobs and Batch Progress updated consistently
      // -------------------------------------------------------------
      // Recruitment progress remains 'Applied' (distinct from validation status, BR-28)
      expect(reviewedRecord.recruitmentStage).toBe('Applied');

      // Recalculate and verify batch monitoring summary
      const recalculated = batchRepository.recalculateBatchProgress(
        createdBatch.id,
        'Admin (Talent Support)'
      );
      const updatedParticipant = recalculated.participants.find(
        (p) => p.id === 'stu-1'
      );
      expect(updatedParticipant?.phase1CompletedCount).toBe(1);

      const summary = batchRepository.getBatchMonitoringSummary(createdBatch.id);
      expect(summary).toBeDefined();
      expect(summary?.validationBreakdown.Approved).toBe(1);
      expect(summary?.cohortTotalCompleted).toBe(1);
      expect(summary?.pacingDistribution['Needs Reminder']).toBe(1); // 1 out of 5 target
    });
  });

  describe('BLG-JAT-043: Negative and Edge Cases Regression Tests', () => {
    it('validates empty required fields and duplicate batch names on batch creation', () => {
      // 1. Duplicate batch name (case-insensitive)
      expect(() => {
        batchRepository.createBatch({
          name: 'JAT Batch 1', // Already exists in default fixtures
          affiliatedCohortIds: ['cohort-fe-1'],
          phase1: {
            phaseNumber: 1,
            enabled: true,
            dateRanges: [
              {
                id: 'r1',
                label: 'R1',
                startDate: '2025-03-01',
                endDate: '2025-03-15',
                targets: [{ id: 't1', jobLevel: 'Junior Level', targetCount: 1 }],
              },
            ],
          },
          phase2: { phaseNumber: 2, enabled: false, dateRanges: [] },
        });
      }).toThrow(/sudah digunakan/i);

      // 2. Empty batch name
      expect(() => {
        batchRepository.createBatch({
          name: '   ',
          affiliatedCohortIds: ['cohort-fe-1'],
          phase1: {
            phaseNumber: 1,
            enabled: true,
            dateRanges: [
              {
                id: 'r1',
                label: 'R1',
                startDate: '2025-03-01',
                endDate: '2025-03-15',
                targets: [{ id: 't1', jobLevel: 'Junior Level', targetCount: 1 }],
              },
            ],
          },
          phase2: { phaseNumber: 2, enabled: false, dateRanges: [] },
        });
      }).toThrow(/wajib diisi/i);
    });

    it('rejects future application date and out-of-range date inputs (BR-13, BR-14, BR-45)', () => {
      batchRepository.setActiveRole('Student');
      batchRepository.setActiveStudentId('stu-1');

      // 1. Future date relative to referenceDate 2025-03-10
      expect(() => {
        batchRepository.submitStudentApplication(
          {
            batchId: 'jat-batch-1',
            studentId: 'stu-1',
            dateApplied: '2025-03-25', // Future
            role: 'QA Engineer',
            company: 'PT Test',
            location: 'Jakarta',
            position: 'Full-time',
            jobLevel: 'Junior Level',
            workSystem: 'Remote / WFH',
            yearsOfExperience: '1 tahun',
            vacancyUrl: 'https://test.com',
            evidenceFile: {
              name: 'proof.png',
              size: 1024,
              type: 'image/png',
            },
          },
          '2025-03-10'
        );
      }).toThrow(/tidak boleh berada di masa depan/i);

      // 2. Out-of-range past date: creates record with initial status 'Rejected' (BR-14, BR-45, DSN-TBD-04)
      const outOfRangeApp = batchRepository.submitStudentApplication(
        {
          batchId: 'jat-batch-1',
          studentId: 'stu-1',
          dateApplied: '2025-02-15', // Outside 2025-03-01 - 2025-03-15
          role: 'QA Engineer',
          company: 'PT Test',
          location: 'Jakarta',
          position: 'Full-time',
          jobLevel: 'Junior Level',
          workSystem: 'Remote / WFH',
          yearsOfExperience: '1 tahun',
          vacancyUrl: 'https://test.com',
          evidenceFile: {
            name: 'proof.png',
            size: 1024,
            type: 'image/png',
          },
        },
        '2025-03-10'
      );

      expect(outOfRangeApp.validationStatus).toBe('Rejected');
      expect(outOfRangeApp.rejectionReason).toMatch(/di luar rentang tanggal aktif/i);
    });

    it('enforces mandatory rejection reason when Admin rejects a Request (BR-24, DSN-TBD-03)', () => {
      batchRepository.setActiveRole('Admin (Talent Support)');

      const waitingRequests = batchRepository.listWaitingConfirmationRequests();
      expect(waitingRequests.length).toBeGreaterThan(0);
      const targetReq = waitingRequests[0];

      // Rejecting without reason throws error
      expect(() => {
        batchRepository.updateApplicationValidationStatus(targetReq.application.id, {
          validationStatus: 'Rejected',
          rejectionReason: '', // Empty reason
          actorRole: 'Admin (Talent Support)',
        });
      }).toThrow(/alasan penolakan.*wajib diisi/i);
    });

    it('preserves data intact when canceling destructive actions (Delete Batch & Remove Participant)', () => {
      batchRepository.setActiveRole('Admin (Talent Support)');

      // Cancel Remove Participant (confirmed = false)
      expect(() => {
        batchRepository.removeParticipantFromBatch('jat-batch-1', 'stu-1', false);
      }).toThrow(/penghapusan peserta dibatalkan/i);

      // Participant remains in batch
      const batch = batchRepository.getBatchById('jat-batch-1');
      expect(batch?.participants.some((p) => p.id === 'stu-1')).toBe(true);

      // Cancel / mismatch Delete Batch
      expect(() => {
        batchRepository.deleteBatch('jat-batch-1', 'Wrong Batch Name');
      }).toThrow(/nama batch tidak cocok/i);

      // Batch remains in repository
      expect(batchRepository.getBatchById('jat-batch-1')).toBeDefined();
    });

    it('blocks unauthorized Student role from executing Admin mutations (BR-33, BR-43)', () => {
      batchRepository.setActiveRole('Student');

      // Student cannot delete batch
      expect(() => {
        batchRepository.deleteBatch('jat-batch-1', 'JAT Batch 1', {
          actorRole: 'Student',
        });
      }).toThrow(/akses ditolak/i);

      // Student cannot review HITL requests
      expect(() => {
        batchRepository.updateApplicationValidationStatus('app-1', {
          validationStatus: 'Approved',
          actorRole: 'Student',
        });
      }).toThrow(/akses ditolak/i);

      // Student cannot inspect admin queues
      expect(() => {
        batchRepository.listWaitingConfirmationRequests(undefined, {
          actorRole: 'Student',
        });
      }).toThrow(/akses ditolak/i);
    });
  });
});
