import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import { INITIAL_MOCK_BATCHES } from '../mocks/jatData';
import { batchRepository, MockBatchRepository } from '../services/batchRepository';
import {
  validateBatchDeleteConfirmation,
  validateBatchInput,
} from '../services/batchValidator';
import type { CreateOrUpdateBatchInput } from '../types/jat';

function createValidInput(overrides?: Partial<CreateOrUpdateBatchInput>): CreateOrUpdateBatchInput {
  return {
    name: 'UI/UX Design Batch 12',
    affiliatedCohortIds: ['cohort-uiux-21'],
    phase1: {
      phaseNumber: 1,
      enabled: true,
      dateRanges: [
        {
          id: 'r-1',
          label: 'Date Range 1',
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          targets: [
            { id: 't-1', jobLevel: 'Junior Level', targetCount: 15 },
            { id: 't-2', jobLevel: 'Internship', targetCount: 10 },
          ],
        },
      ],
    },
    phase2: {
      phaseNumber: 2,
      enabled: false,
      dateRanges: [],
    },
    ...overrides,
  };
}

describe('EP-JAT-01 Business Rules & Repository Unit Tests', () => {
  let repo: MockBatchRepository;

  beforeEach(() => {
    repo = new MockBatchRepository(INITIAL_MOCK_BATCHES);
  });

  it('BR-01: rejects empty or whitespace-only batch name', () => {
    const input = createValidInput({ name: '   ' });
    const result = validateBatchInput(input, repo.listBatches());
    expect(result.valid).toBe(false);
    expect(result.errors.name).toMatch(/wajib diisi/i);
  });

  it('BR-02: rejects duplicate batch names (case-insensitive) and allows own name during edit', () => {
    const duplicateInput = createValidInput({
      name: 'jat batch 1', // matches INITIAL_MOCK_BATCHES[0] ('JAT Batch 1')
    });
    const createResult = validateBatchInput(duplicateInput, repo.listBatches());
    expect(createResult.valid).toBe(false);
    expect(createResult.errors.name).toMatch(/sudah digunakan/i);

    // Allowed when editing the same batch id ('jat-batch-1')
    const editResult = validateBatchInput(duplicateInput, repo.listBatches(), 'jat-batch-1');
    expect(editResult.valid).toBe(true);
  });

  it('BR-03: rejects date range where startDate is later than endDate', () => {
    const invalidDateInput = createValidInput({
      phase1: {
        phaseNumber: 1,
        enabled: true,
        dateRanges: [
          {
            id: 'r-invalid',
            label: 'Date Range 1',
            startDate: '2025-05-15',
            endDate: '2025-05-01',
            targets: [{ id: 't-1', jobLevel: 'Junior Level', targetCount: 10 }],
          },
        ],
      },
    });
    const result = validateBatchInput(invalidDateInput, repo.listBatches());
    expect(result.valid).toBe(false);
    expect(result.errors['phase1.range.0.dates']).toMatch(
      /Start Date tidak boleh melewati End Date/i
    );
  });

  it('BR-04: supports Phase 2 as optional (valid when disabled, validated when enabled)', () => {
    const phase1OnlyInput = createValidInput({
      name: 'QA Automation Batch 5',
      phase2: { phaseNumber: 2, enabled: false, dateRanges: [] },
    });
    const created = repo.createBatch(phase1OnlyInput);
    expect(created.phase2.enabled).toBe(false);
    expect(created.phase2.dateRanges).toHaveLength(0);

    // When Phase 2 is enabled with invalid start > end date, it must be rejected
    const invalidPhase2Input = createValidInput({
      name: 'QA Automation Batch 6',
      phase2: {
        phaseNumber: 2,
        enabled: true,
        dateRanges: [
          {
            id: 'p2-r1',
            label: 'Date Range 1',
            startDate: '2025-07-20',
            endDate: '2025-07-01',
            targets: [{ id: 'p2-t1', jobLevel: 'Mid Level', targetCount: 5 }],
          },
        ],
      },
    });
    const check = validateBatchInput(invalidPhase2Input, repo.listBatches());
    expect(check.valid).toBe(false);
    expect(check.errors['phase2.range.0.dates']).toBeDefined();
  });

  it('BR-05: supports multiple date ranges and multiple job-level targets per phase', () => {
    const multiRangeInput = createValidInput({
      name: 'Product Management Batch 9',
      phase1: {
        phaseNumber: 1,
        enabled: true,
        dateRanges: [
          {
            id: 'r1',
            label: 'Date Range 1',
            startDate: '2025-03-01',
            endDate: '2025-03-15',
            targets: [
              { id: 't1', jobLevel: 'Junior Level', targetCount: 10 },
              { id: 't2', jobLevel: 'Internship', targetCount: 5 },
            ],
          },
          {
            id: 'r2',
            label: 'Date Range 2',
            startDate: '2025-03-16',
            endDate: '2025-03-31',
            targets: [{ id: 't3', jobLevel: 'Mid Level', targetCount: 12 }],
          },
        ],
      },
    });

    const created = repo.createBatch(multiRangeInput);
    expect(created.phase1.dateRanges).toHaveLength(2);
    expect(created.phase1.dateRanges[0].targets).toHaveLength(2);
    expect(created.phase1.dateRanges[1].targets[0].targetCount).toBe(12);
  });

  it('BR-09 & DSN-TBD-05: requires exact batch name confirmation before deleting a batch', () => {
    const mismatch = validateBatchDeleteConfirmation('JAT Batch 1', 'JAT Batch 99');
    expect(mismatch.valid).toBe(false);

    expect(() => repo.deleteBatch('jat-batch-1', 'Wrong Name')).toThrow(/Nama batch tidak cocok/i);
    expect(repo.getBatchById('jat-batch-1')).toBeDefined();

    repo.deleteBatch('jat-batch-1', 'JAT Batch 1');
    expect(repo.getBatchById('jat-batch-1')).toBeUndefined();
  });
});

describe('EP-JAT-01 UI Workflow Integration Tests', () => {
  beforeEach(() => {
    batchRepository.resetToDefault();
  });

  it('renders batch list, filters by search query, and recovers from empty search state', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/jat/batches']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('JAT Batch 1')).toBeInTheDocument();
    expect(screen.getByText('JAT Batch 2')).toBeInTheDocument();

    const searchInput = screen.getByLabelText('Cari Nama Batch');
    await user.type(searchInput, 'CyberSecurity NonExistent');

    expect(screen.getByText('Batch Tidak Ditemukan')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reset Pencarian/i }));
    expect(screen.getByText('JAT Batch 1')).toBeInTheDocument();
  });

  it('validates form errors and creates a new batch with confirmation dialog', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/jat/batches/create']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Attempt to save with empty batch name (BR-01)
    await user.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));
    expect(screen.getByText(/Nama Program \/ Batch JAT wajib diisi/i)).toBeInTheDocument();

    // Enter duplicate batch name (BR-02)
    const nameInput = screen.getByLabelText(/Nama Program \/ Batch JAT/i);
    await user.type(nameInput, 'JAT Batch 1');
    await user.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));
    expect(screen.getByText(/sudah digunakan/i)).toBeInTheDocument();

    // Enter unique batch name and add a second Date Range in Phase 1
    await user.clear(nameInput);
    await user.type(nameInput, 'Backend Engineering Batch 7');
    await user.click(screen.getByRole('button', { name: /Add Date Range/i }));

    expect(screen.getByText(/Phase 1 — Date Range 2/i)).toBeInTheDocument();

    // Submit valid form -> opens SaveBatchConfirmationModal
    await user.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Simpan & Terapkan Jadwal Batch\?/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /Ya, Simpan & Aktifkan/i }));

    // Navigates to Batch Detail Page of the newly created batch
    expect(
      await screen.findByRole('heading', { name: 'Backend Engineering Batch 7' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Belum Ada Siswa di Batch Ini/i)).toBeInTheDocument();
  });

  it('supports Recalculate Progress (DSN-TBD-02) and exact-name Delete Batch modal (DSN-TBD-05) on Batch Detail', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/jat/batches/jat-batch-1']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'JAT Batch 1' })).toBeInTheDocument();

    // Click Recalculate Progress as Admin
    await user.click(screen.getByRole('button', { name: /Recalculate Progress/i }));
    expect(screen.getByText(/berhasil dihitung ulang oleh Admin/i)).toBeInTheDocument();

    // Open Delete Batch modal
    await user.click(screen.getByRole('button', { name: /Hapus Batch/i }));
    const modal = screen.getByRole('dialog');
    const confirmButton = within(modal).getByRole('button', { name: /Hapus Batch/i });
    expect(confirmButton).toBeDisabled();

    const confirmInput = within(modal).getByLabelText(/mengonfirmasi penghapusan/i);
    await user.type(confirmInput, 'Wrong Batch Name');
    expect(confirmButton).toBeDisabled();

    await user.clear(confirmInput);
    await user.type(confirmInput, 'JAT Batch 1');
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);

    // Redirected to Batch Management list and batch is removed
    expect(
      await screen.findByRole('heading', { name: 'Job Application Tracker' })
    ).toBeInTheDocument();
    expect(screen.queryByText('JAT Batch 1')).not.toBeInTheDocument();
  });
});
