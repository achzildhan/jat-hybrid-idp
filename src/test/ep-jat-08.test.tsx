import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import { batchRepository, MockBatchRepository } from '../services/batchRepository';

function renderAppAt(
  initialEntry = '/admin/jat/requests',
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

describe('EP-JAT-08 — Human-in-the-Loop: Pemeriksaan dan tindak lanjut Request (BLG-JAT-027..030)', () => {
  beforeEach(() => {
    batchRepository.resetToDefault();
  });

  it('includes only Waiting Confirmation submissions in the Request Queue and omits the bulk action toolbar per DSN-TBD-03 (BR-32)', () => {
    renderAppAt('/admin/jat/requests');

    // Queue table displays the 3 synthetic Waiting Confirmation records (app-101 BNI, app-106 Tokopedia, app-107 Halodoc)
    expect(screen.getByText('Bank Negara Indonesia (BNI)')).toBeInTheDocument();
    expect(screen.getByText('Tokopedia')).toBeInTheDocument();
    expect(screen.getByText('Halodoc')).toBeInTheDocument();

    // Approved (Traveloka Indonesia, GoTo Financial, Telkomsel Digital) and Rejected (Bukalapak) must not appear in the Request Queue
    expect(screen.queryByText('Traveloka Indonesia')).not.toBeInTheDocument();
    expect(screen.queryByText('GoTo Financial')).not.toBeInTheDocument();
    expect(screen.queryByText('Bukalapak')).not.toBeInTheDocument();
    expect(screen.queryByText('Telkomsel Digital')).not.toBeInTheDocument();

    // DSN-TBD-03: Bulk action buttons and row selection checkboxes must not exist
    expect(screen.queryByText(/Konfirmasi Terpilih/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tolak Terpilih/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    // Admin top sub-navigation Request badge reflects the live Waiting Confirmation count (3)
    expect(screen.getByTestId('admin-request-nav-badge')).toHaveTextContent('3');
  });

  it('supports search and multi-criteria filtering (Batch, Phase, Date Range, Job Level) and recovery from empty filter states (BR-31)', async () => {
    const user = userEvent.setup();
    renderAppAt('/admin/jat/requests');

    // 1. Search by company or student name
    const searchInput = screen.getByRole('searchbox', {
      name: /Cari nama student, perusahaan, atau role pada antrean Request/i,
    });
    await user.type(searchInput, 'Tokopedia');

    expect(screen.getByText('Tokopedia')).toBeInTheDocument();
    expect(screen.queryByText('Bank Negara Indonesia (BNI)')).not.toBeInTheDocument();
    expect(screen.queryByText('Halodoc')).not.toBeInTheDocument();

    await user.clear(searchInput);
    expect(screen.getByText('Bank Negara Indonesia (BNI)')).toBeInTheDocument();
    expect(screen.getByText('Tokopedia')).toBeInTheDocument();
    expect(screen.getByText('Halodoc')).toBeInTheDocument();

    // 2. Open Filter Popover (Stitch 9df4e619) and filter by Batch + Phase + Date Range + Job Level
    await user.click(screen.getByRole('button', { name: /Filter Data Request JAT/i }));
    const filterPopover = screen.getByRole('dialog', {
      name: /Panel Filter Data Request JAT/i,
    });
    expect(filterPopover).toBeInTheDocument();

    await user.selectOptions(within(filterPopover).getByLabelText('Batch'), 'jat-batch-1');
    await user.selectOptions(within(filterPopover).getByLabelText('Phase'), '2');
    await user.selectOptions(
      within(filterPopover).getByLabelText('Date Range'),
      'Date Range 1'
    );
    await user.selectOptions(
      within(filterPopover).getByLabelText('Job Level'),
      'Junior Level'
    );
    await user.click(within(filterPopover).getByRole('button', { name: /Apply Filter/i }));

    // Only Annette Black (Tokopedia - app-106) matches JAT 1 + Phase 2 + Date Range 1 + Junior Level
    expect(screen.getByText('Tokopedia')).toBeInTheDocument();
    expect(screen.queryByText('Bank Negara Indonesia (BNI)')).not.toBeInTheDocument();
    expect(screen.queryByText('Halodoc')).not.toBeInTheDocument();

    // 3. Filter to a combination with no matches -> shows actionable empty filter state & reset button
    await user.click(screen.getByRole('button', { name: /Filter Data Request JAT/i }));
    const filterPopover2 = screen.getByRole('dialog', {
      name: /Panel Filter Data Request JAT/i,
    });
    await user.selectOptions(
      within(filterPopover2).getByLabelText('Job Level'),
      'Senior Level'
    );
    await user.click(within(filterPopover2).getByRole('button', { name: /Apply Filter/i }));

    expect(
      screen.getByText(/Tidak Ada Request yang Sesuai Filter/i)
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Reset Pencarian & Filter/i })
    );
    expect(screen.getByText('Bank Negara Indonesia (BNI)')).toBeInTheDocument();
    expect(screen.getByText('Tokopedia')).toBeInTheDocument();
    expect(screen.getByText('Halodoc')).toBeInTheDocument();
  });

  it('opens the HITL Evidence Inspector from a queue row and displays recorded fields, evidence preview, and all 7 BR-39 IDP attributes per DSN-TBD-06 (BR-39, BR-40)', async () => {
    const user = userEvent.setup();
    renderAppAt('/admin/jat/requests');

    await user.click(
      screen.getByRole('button', {
        name: /Konfirmasi request Marvin McKinney di Bank Negara Indonesia \(BNI\)/i,
      })
    );

    const modal = screen.getByRole('dialog', { name: /Detail Konfirmasi JAT/i });
    expect(modal).toBeInTheDocument();

    // Context header & student identity
    expect(within(modal).getAllByText('Marvin McKinney').length).toBeGreaterThan(0);
    expect(within(modal).getByText('JAT Batch 1')).toBeInTheDocument();
    expect(within(modal).getByText('Phase 1')).toBeInTheDocument();

    // Evidence preview card & file name
    expect(
      within(modal).getByText(/Pratinjau Bukti: Marvin_BNI_Proof\.png/i)
    ).toBeInTheDocument();

    // Recorded form fields section
    const formSection = within(modal).getByRole('region', {
      name: /Data Form Pelaporan Mahasiswa/i,
    });
    expect(within(formSection).getByText('Bank Negara Indonesia (BNI)')).toBeInTheDocument();
    expect(within(formSection).getByText('Jakarta Pusat')).toBeInTheDocument();
    expect(within(formSection).getByText('UI/UX Designer')).toBeInTheDocument();

    // DSN-TBD-06: All 7 BR-39 attributes are rendered individually in the checklist
    const inspectorSection = within(modal).getByRole('region', {
      name: /Evidence Inspector dan Checklist 7 Atribut BR-39/i,
    });
    expect(within(inspectorSection).getByText('7 / 7 Atribut')).toBeInTheDocument();

    const expectedAttributeLabels = [
      'Date Applied',
      'Role',
      'Company',
      'Location',
      'Position',
      'Job Level',
      'Work System',
    ];
    for (const label of expectedAttributeLabels) {
      expect(within(inspectorSection).getByText(label)).toBeInTheDocument();
    }

    // Work System shows Ambiguous / Unclear finding for app-101
    expect(
      within(inspectorSection).getByText(/Ambiguous \/ Unclear/i)
    ).toBeInTheDocument();
  });

  it('handles Confirm (Approved) workflow with secondary confirmation, cancel recovery, queue removal, original submission preservation, and Student feedback sync (BR-25, BR-29, BR-32)', async () => {
    const user = userEvent.setup();
    renderAppAt('/admin/jat/requests');

    // Open inspector for app-101 (Marvin McKinney - Bank Negara Indonesia (BNI))
    await user.click(
      screen.getByRole('button', {
        name: /Konfirmasi request Marvin McKinney di Bank Negara Indonesia \(BNI\)/i,
      })
    );
    const modal = screen.getByRole('dialog', { name: /Detail Konfirmasi JAT/i });

    // Select 'Iya (Valid — Setujui)'
    await user.click(
      within(modal).getByRole('button', { name: /Iya \(Valid — Setujui\)/i })
    );
    await user.click(within(modal).getByRole('button', { name: /Konfirmasi JAT/i }));

    // Secondary confirmation dialog appears; canceling keeps the record in Waiting Confirmation
    const confirmDialog = screen.getByRole('dialog', {
      name: /Dialog Konfirmasi Keputusan Review/i,
    });
    expect(confirmDialog).toBeInTheDocument();

    await user.click(within(confirmDialog).getByRole('button', { name: /^Kembali$/i }));
    expect(
      screen.queryByRole('dialog', { name: /Dialog Konfirmasi Keputusan Review/i })
    ).not.toBeInTheDocument();
    expect(
      batchRepository.getStudentApplicationById('jat-batch-1', 'stu-1', 'app-101')
        ?.validationStatus
    ).toBe('Waiting Confirmation');

    // Submit again and confirm
    await user.click(within(modal).getByRole('button', { name: /Konfirmasi JAT/i }));
    const confirmDialog2 = screen.getByRole('dialog', {
      name: /Dialog Konfirmasi Keputusan Review/i,
    });
    await user.click(
      within(confirmDialog2).getByRole('button', { name: /Ya, Setujui/i })
    );

    // 1. Removed from Waiting Confirmation queue (BR-32)
    expect(
      screen.queryByRole('button', {
        name: /Konfirmasi request Marvin McKinney di Bank Negara Indonesia \(BNI\)/i,
      })
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('admin-request-nav-badge')).toHaveTextContent('2');

    // 2. Original submission record is preserved in the repository with updated status & traceable history (BR-25, BR-32)
    const updatedApp = batchRepository.getStudentApplicationById(
      'jat-batch-1',
      'stu-1',
      'app-101'
    );
    expect(updatedApp).toBeDefined();
    expect(updatedApp?.validationStatus).toBe('Approved');
    expect(updatedApp?.reviewHistory).toHaveLength(1);
    expect(updatedApp?.reviewHistory?.[0]).toMatchObject({
      action: 'Approved',
      resultingStatus: 'Approved',
      actorRole: 'Admin (Talent Support)',
    });

    // 3. Participant completed count in JAT Batch 1 increased from 10 to 11 (BR-29)
    const updatedParticipant = batchRepository.getParticipantInBatch(
      'jat-batch-1',
      'stu-1'
    );
    expect(updatedParticipant?.phase1CompletedCount).toBe(11);

    // 4. Switch to Student Portal and verify Student sees Approved status for BNI
    await user.click(screen.getByRole('link', { name: /Switch to Student Portal/i }));
    await user.click(
      screen.getByRole('link', { name: /Detail JAT Batch 1/i })
    );

    expect(screen.getByText('Approved: 3')).toBeInTheDocument();
    expect(screen.getByText('Waiting: 0')).toBeInTheDocument();
  });

  it('requires a mandatory rejection reason when rejecting (BR-24), records traceable review history (BR-25), removes item from queue (BR-32), and updates Student feedback view', async () => {
    const user = userEvent.setup();
    renderAppAt('/admin/jat/requests');

    await user.click(
      screen.getByRole('button', {
        name: /Konfirmasi request Marvin McKinney di Bank Negara Indonesia \(BNI\)/i,
      })
    );
    const modal = screen.getByRole('dialog', { name: /Detail Konfirmasi JAT/i });

    // Select 'Tidak (Tolak Request)'
    await user.click(
      within(modal).getByRole('button', { name: /Tidak \(Tolak Request\)/i })
    );

    // Try submitting with an empty rejection reason -> blocked by BR-24
    await user.click(within(modal).getByRole('button', { name: /^Tolak Request/i }));
    expect(within(modal).getByRole('alert')).toHaveTextContent(/BR-24/i);
    expect(
      screen.queryByRole('dialog', { name: /Dialog Konfirmasi Keputusan Review/i })
    ).not.toBeInTheDocument();

    // Provide a valid rejection reason
    const reasonTextarea = within(modal).getByLabelText(
      /Berikan alasan mengapa request JAT ini tidak valid/i
    );
    await user.type(
      reasonTextarea,
      'Tangkapan layar bukti lamaran terpotong dan nama perusahaan tidak terlihat.'
    );

    await user.click(within(modal).getByRole('button', { name: /^Tolak Request/i }));
    const confirmDialog = screen.getByRole('dialog', {
      name: /Dialog Konfirmasi Keputusan Review/i,
    });
    expect(confirmDialog).toBeInTheDocument();

    // Confirm rejection
    await user.click(
      within(confirmDialog).getByRole('button', { name: /Ya, Tolak Request/i })
    );

    // Removed from Request Queue
    expect(
      screen.queryByRole('button', {
        name: /Konfirmasi request Marvin McKinney di Bank Negara Indonesia \(BNI\)/i,
      })
    ).not.toBeInTheDocument();

    // Preserved in repository with rejectionReason and reviewHistory
    const rejectedApp = batchRepository.getStudentApplicationById(
      'jat-batch-1',
      'stu-1',
      'app-101'
    );
    expect(rejectedApp?.validationStatus).toBe('Rejected');
    expect(rejectedApp?.rejectionReason).toBe(
      'Tangkapan layar bukti lamaran terpotong dan nama perusahaan tidak terlihat.'
    );
    expect(rejectedApp?.reviewHistory?.[0]).toMatchObject({
      action: 'Rejected',
      resultingStatus: 'Rejected',
      actorRole: 'Admin (Talent Support)',
      rejectionReason:
        'Tangkapan layar bukti lamaran terpotong dan nama perusahaan tidak terlihat.',
    });

    // Switch to Student Portal and verify Student sees the new rejection reason in the detail drawer
    await user.click(screen.getByRole('link', { name: /Switch to Student Portal/i }));
    await user.click(
      screen.getByRole('link', { name: /Detail JAT Batch 1/i })
    );

    expect(screen.getByText('Rejected: 2')).toBeInTheDocument();
    expect(screen.getByText('Waiting: 0')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /Lihat detail pengajuan Bank Negara Indonesia \(BNI\)/i,
      })
    );
    const studentDrawer = screen.getByRole('dialog', {
      name: /Bank Negara Indonesia \(BNI\)/i,
    });
    expect(
      within(studentDrawer).getByText(
        /Tangkapan layar bukti lamaran terpotong dan nama perusahaan tidak terlihat\./i
      )
    ).toBeInTheDocument();
  });

  it('enforces deterministic date-range / file-format rules (BR-14, BR-26) and role authorization (BR-33, BR-43) so neither UI nor service can silently override them', async () => {
    const repo = new MockBatchRepository();

    // 1. BR-33 / BR-43: Student role cannot execute Admin HITL review
    expect(() =>
      repo.reviewApplicationRequest('app-101', {
        decision: 'Approved',
        actorRole: 'Student',
        confirmed: true,
      })
    ).toThrow(/BR-33|BR-43/i);

    // 2. Explicit confirmation flag is required before committing review
    expect(() =>
      repo.reviewApplicationRequest('app-101', {
        decision: 'Approved',
        actorRole: 'Admin (Talent Support)',
        confirmed: false,
      })
    ).toThrow(/konfirmasi eksplisit/i);

    // 3. BR-14 & BR-26: Out-of-range Date Applied record (submitted on 2025-02-20 outside JAT 1 active range)
    // cannot be overridden to Approved even by Super Admin
    const outOfRangeSubmission = repo.submitStudentApplication(
      {
        batchId: 'jat-batch-1',
        studentId: 'stu-1',
        dateApplied: '2025-02-20',
        role: 'UI Designer',
        company: 'Contoh Out of Range Corp',
        location: 'Jakarta',
        position: 'Full-time',
        jobLevel: 'Junior Level',
        workSystem: 'Hybrid',
        yearsOfExperience: '1 Tahun',
        vacancyUrl: 'https://careers.example.com/out-of-range',
        evidenceFile: {
          name: 'out_of_range.png',
          size: 204800,
          type: 'image/png',
        },
      },
      '2025-03-10'
    );
    expect(outOfRangeSubmission.validationStatus).toBe('Rejected');

    expect(() =>
      repo.reviewApplicationRequest(outOfRangeSubmission.id, {
        decision: 'Approved',
        actorRole: 'Super Admin',
        confirmed: true,
      })
    ).toThrow(/BR-14|BR-26/i);

    // 4. Verify UI role simulator blocks Student role from submitting HITL decisions
    const user = userEvent.setup();
    renderAppAt('/admin/jat/requests');

    await user.selectOptions(
      screen.getByLabelText(/Simulasi Peran \(BR-33\):/i),
      'Student'
    );

    await user.click(
      screen.getByRole('button', {
        name: /Konfirmasi request Marvin McKinney di Bank Negara Indonesia \(BNI\)/i,
      })
    );
    const modal = screen.getByRole('dialog', { name: /Detail Konfirmasi JAT/i });
    await user.click(within(modal).getByRole('button', { name: /Konfirmasi JAT/i }));
    expect(within(modal).getByRole('alert')).toHaveTextContent(/BR-33|BR-43/i);
  });
});
