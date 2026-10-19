import { fireEvent, render, screen, within } from '@testing-library/react';
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
  validateEvidenceFile,
  validateStudentApplicationSubmission,
} from '../services/batchValidator';
import type { CreateStudentApplicationInput } from '../types/jat';

describe('EP-JAT-04 Domain & Repository Validation Tests: Required Fields, Dates, File Formats & Persistence (BLG-JAT-015, BLG-JAT-016)', () => {
  let repo: MockBatchRepository;

  const validBaseInput: CreateStudentApplicationInput = {
    batchId: 'jat-batch-1',
    studentId: 'stu-1',
    dateApplied: '2025-03-10',
    role: 'UI/UX Designer',
    company: 'Pertamina (Persero)',
    location: 'Jakarta Pusat',
    position: 'Full-time',
    yearsOfExperience: '0-1 Tahun',
    jobLevel: 'Junior Level',
    workSystem: 'Hybrid',
    vacancyUrl: 'https://recruitment.pertamina.com/job/uiux-designer',
    evidenceFile: {
      name: 'bukti_lamaran_pertamina.png',
      size: 185000,
      type: 'image/png',
    },
  };

  beforeEach(() => {
    repo = new MockBatchRepository(
      INITIAL_MOCK_BATCHES,
      MOCK_STUDENT_DIRECTORY,
      INITIAL_MOCK_APPLICATIONS
    );
  });

  it('accepts allowed file types (JPG, JPEG, PNG) and rejects unsupported extensions, empty files, oversized files, and MIME spoofing (BR-11, BR-12)', () => {
    // Allowed PNG, JPG, JPEG
    expect(
      validateEvidenceFile({ name: 'proof.png', size: 1024, type: 'image/png' }).valid
    ).toBe(true);
    expect(
      validateEvidenceFile({ name: 'proof.jpg', size: 2048, type: 'image/jpeg' }).valid
    ).toBe(true);
    expect(
      validateEvidenceFile({ name: 'proof.jpeg', size: 4096, type: 'image/jpeg' }).valid
    ).toBe(true);

    // Missing file
    expect(validateEvidenceFile(null).valid).toBe(false);

    // Empty file (0 bytes)
    const emptyCheck = validateEvidenceFile({
      name: 'empty.png',
      size: 0,
      type: 'image/png',
    });
    expect(emptyCheck.valid).toBe(false);
    expect(emptyCheck.error).toMatch(/kosong \(0 byte\)/i);

    // Oversized file (> 5MB)
    const oversizedCheck = validateEvidenceFile({
      name: 'huge.png',
      size: 6 * 1024 * 1024,
      type: 'image/png',
    });
    expect(oversizedCheck.valid).toBe(false);
    expect(oversizedCheck.error).toMatch(/5MB/i);

    // Unsupported extension (.pdf, .webp)
    const pdfCheck = validateEvidenceFile({
      name: 'cv_document.pdf',
      size: 5000,
      type: 'application/pdf',
    });
    expect(pdfCheck.valid).toBe(false);
    expect(pdfCheck.error).toMatch(/JPG, JPEG, dan PNG/i);

    // Extension alone is NOT proof of validity: .png extension with application/pdf MIME type
    const spoofedMimeCheck = validateEvidenceFile({
      name: 'disguised_document.png',
      size: 5000,
      type: 'application/pdf',
    });
    expect(spoofedMimeCheck.valid).toBe(false);
    expect(spoofedMimeCheck.error).toMatch(/tidak didukung|tidak cocok/i);

    // Extension/MIME mismatch (.png with image/jpeg)
    const mismatchedImageCheck = validateEvidenceFile({
      name: 'mismatch.png',
      size: 5000,
      type: 'image/jpeg',
    });
    expect(mismatchedImageCheck.valid).toBe(false);
    expect(mismatchedImageCheck.error).toMatch(/tidak cocok/i);

    // Missing MIME type
    const missingMimeCheck = validateEvidenceFile({
      name: 'no_mime.jpg',
      size: 5000,
      type: '',
    });
    expect(missingMimeCheck.valid).toBe(false);
    expect(missingMimeCheck.error).toMatch(/Tipe MIME berkas tidak terdeteksi/i);

    // Magic header byte mismatch when headerBytes are supplied
    const badHeaderCheck = validateEvidenceFile({
      name: 'corrupt.png',
      size: 5000,
      type: 'image/png',
      headerBytes: [0x25, 0x50, 0x44, 0x46], // %PDF header instead of PNG
    });
    expect(badHeaderCheck.valid).toBe(false);
    expect(badHeaderCheck.error).toMatch(/signature header tidak cocok/i);
  });

  it('validates all required fields (BR-10) and rejects future application dates (BR-13)', () => {
    const batch = repo.getBatchById('jat-batch-1')!;

    // Missing all fields
    const emptyResult = validateStudentApplicationSubmission(
      {
        batchId: 'jat-batch-1',
        studentId: 'stu-1',
        dateApplied: '',
        role: '',
        company: '',
        location: '',
        position: '',
        yearsOfExperience: '',
        jobLevel: '',
        workSystem: '',
        vacancyUrl: '',
        evidenceFile: null,
      },
      batch,
      '2025-03-10'
    );
    expect(emptyResult.valid).toBe(false);
    expect(Object.keys(emptyResult.errors)).toEqual(
      expect.arrayContaining([
        'dateApplied',
        'role',
        'company',
        'location',
        'position',
        'yearsOfExperience',
        'jobLevel',
        'workSystem',
        'vacancyUrl',
        'evidenceFile',
      ])
    );

    // Future date (2025-03-12 > referenceDate 2025-03-10) -> rejected per BR-13
    const futureResult = validateStudentApplicationSubmission(
      {
        ...validBaseInput,
        dateApplied: '2025-03-12',
      },
      batch,
      '2025-03-10'
    );
    expect(futureResult.valid).toBe(false);
    expect(futureResult.errors.dateApplied).toMatch(/masa depan/i);

    expect(() =>
      repo.submitStudentApplication(
        { ...validBaseInput, dateApplied: '2025-03-12' },
        '2025-03-10'
      )
    ).toThrow(/masa depan/i);
  });

  it('persists in-range submissions as Waiting Confirmation (BR-15) and out-of-range past dates as Rejected (BR-14, BR-45, DSN-TBD-04)', () => {
    // 1. Valid in-range submission (2025-03-10 inside Phase 1 Date Range 1: 2025-03-01..2025-03-15)
    const createdInRange = repo.submitStudentApplication(validBaseInput, '2025-03-10');
    expect(createdInRange.validationStatus).toBe('Waiting Confirmation');
    expect(createdInRange.phaseNumber).toBe(1);
    expect(createdInRange.dateRangeLabel).toBe('Date Range 1');
    expect(createdInRange.rejectionReason).toBeUndefined();

    // Verify BR-15: uploading does NOT increment approved quota (phase1CompletedCount remains 10)
    const viewAfterInRange = repo.getStudentBatchView(
      'jat-batch-1',
      'stu-1',
      '2025-03-10'
    )!;
    expect(viewAfterInRange.phase1.completedCount).toBe(10);

    // 2. Out-of-range past date (2025-02-20 < 2025-03-01) -> allowed to submit per DSN-TBD-04, status = Rejected (BR-45)
    const createdOutOfRange = repo.submitStudentApplication(
      {
        ...validBaseInput,
        company: 'Tokopedia',
        role: 'Product Designer',
        dateApplied: '2025-02-20',
      },
      '2025-03-10'
    );
    expect(createdOutOfRange.validationStatus).toBe('Rejected');
    expect(createdOutOfRange.rejectionReason).toMatch(/di luar rentang tanggal aktif/i);

    // Both repeated submissions are persisted in the student's application list
    const allApps = repo.listStudentApplications('jat-batch-1', 'stu-1');
    expect(allApps[0].company).toBe('Tokopedia');
    expect(allApps[1].company).toBe('Pertamina (Persero)');
  });
});

describe('EP-JAT-04 UI Integration Tests: Add Proof Drawer, Validation Errors, File Remove/Replace & Repeated Submissions (BLG-JAT-013, BLG-JAT-014, BLG-JAT-016)', () => {
  beforeEach(() => {
    batchRepository.resetToDefault();
  });

  it('opens the Add Proof drawer, validates missing fields, unsupported/empty files, future dates, and supports file remove/replace before valid submission', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(
      <MemoryRouter initialEntries={['/student/talent-support/jat/jat-batch-1']}>
        <AppRoutes initialStudentId="stu-1" initialReferenceDate="2025-03-10" />
      </MemoryRouter>
    );

    // Open Add Proof of Application Drawer
    await user.click(
      screen.getByRole('button', { name: /\+ Add Proof of Application/i })
    );
    const drawer = screen.getByRole('dialog', { name: /Add Proof of Application/i });
    expect(drawer).toBeInTheDocument();

    // Verify BR-15 explanation is visible inside the drawer
    expect(
      within(drawer).getByText(
        /bukan bahwa pengajuan telah disetujui \(BR-15\)/i
      )
    ).toBeInTheDocument();

    // 1. Submit empty form -> displays required field errors and prevents submission
    await user.click(
      within(drawer).getByRole('button', { name: /Submit Bukti Lamaran/i })
    );
    expect(
      within(drawer).getByText(/Role yang dilamar wajib diisi/i)
    ).toBeInTheDocument();
    expect(
      within(drawer).getByText(/Nama perusahaan \(Company Name\) wajib diisi/i)
    ).toBeInTheDocument();
    expect(
      within(drawer).getByText(/Bukti screenshot lamaran wajib diunggah/i)
    ).toBeInTheDocument();

    // 2. Test unsupported file upload (.pdf) and empty file (0 bytes)
    const fileInput = within(drawer).getByLabelText(/Upload Proof of Application/i);
    const invalidPdf = new File(['%PDF-1.4'], 'resume.pdf', {
      type: 'application/pdf',
    });
    await user.upload(fileInput, invalidPdf);
    expect(
      within(drawer).getByText(/Hanya berkas JPG, JPEG, dan PNG yang diizinkan/i)
    ).toBeInTheDocument();

    const emptyPng = new File([], 'empty.png', { type: 'image/png' });
    await user.upload(fileInput, emptyPng);
    expect(
      within(drawer).getByText(/kosong \(0 byte\)/i)
    ).toBeInTheDocument();

    // 3. Upload valid PNG file -> shows file summary card, then remove & replace with JPEG
    const validPng = new File(['valid-png-content'], 'first_proof.png', {
      type: 'image/png',
    });
    await user.upload(fileInput, validPng);
    expect(within(drawer).getByText('first_proof.png')).toBeInTheDocument();

    // Remove the uploaded file
    await user.click(within(drawer).getByRole('button', { name: /Hapus lampiran bukti/i }));
    expect(within(drawer).queryByText('first_proof.png')).not.toBeInTheDocument();

    // Replace with a valid JPEG file
    const validJpg = new File(['valid-jpeg-content'], 'pertamina_proof_final.jpg', {
      type: 'image/jpeg',
    });
    await user.upload(fileInput, validJpg);
    expect(within(drawer).getByText('pertamina_proof_final.jpg')).toBeInTheDocument();

    // 4. Test Future Date validation error (2025-03-14 > 2025-03-10)
    const dateInput = within(drawer).getByLabelText(/Date Applied/i);
    fireEvent.change(dateInput, { target: { value: '2025-03-14' } });

    fireEvent.change(within(drawer).getByLabelText(/Role Applied/i), {
      target: { value: 'UI/UX Designer' },
    });
    fireEvent.change(within(drawer).getByLabelText(/Company Name/i), {
      target: { value: 'Pertamina (Persero)' },
    });
    fireEvent.change(within(drawer).getByLabelText(/Company Location/i), {
      target: { value: 'Jakarta Pusat' },
    });
    await user.selectOptions(
      within(drawer).getByLabelText(/Position/i),
      'Full-time'
    );
    fireEvent.change(within(drawer).getByLabelText(/Years of Experience/i), {
      target: { value: '0-1 Tahun' },
    });
    await user.selectOptions(
      within(drawer).getByLabelText(/Job Level/i),
      'Junior Level'
    );
    await user.selectOptions(
      within(drawer).getByLabelText(/Work System/i),
      'Hybrid'
    );
    fireEvent.change(within(drawer).getByLabelText(/Link Job Vacancy/i), {
      target: { value: 'https://recruitment.pertamina.com/job/uiux-designer' },
    });

    await user.click(
      within(drawer).getByRole('button', { name: /Submit Bukti Lamaran/i })
    );
    expect(
      within(drawer).getByText(/tidak boleh berada di masa depan/i)
    ).toBeInTheDocument();

    // 5. Fix Date Applied to valid in-range date (2025-03-10) and submit
    fireEvent.change(dateInput, { target: { value: '2025-03-10' } });
    await user.click(
      within(drawer).getByRole('button', { name: /Submit Bukti Lamaran/i })
    );

    // Drawer closes, BR-15 notice appears, and Pertamina is listed in Applied Jobs table
    expect(
      screen.queryByRole('dialog', { name: /Add Proof of Application/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/berhasil diterima untuk pemrosesan verifikasi/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Pertamina (Persero)')).toBeInTheDocument();
    expect(screen.getByText('pertamina_proof_final.jpg')).toBeInTheDocument();
  });

  it('supports canceling drawer, out-of-range Date Applied auto-Rejected warning (BR-14, BR-45, DSN-TBD-04), and repeated submissions', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(
      <MemoryRouter initialEntries={['/student/talent-support/jat/jat-batch-1']}>
        <AppRoutes initialStudentId="stu-1" initialReferenceDate="2025-03-10" />
      </MemoryRouter>
    );

    // Open and cancel drawer -> closes without adding new record
    await user.click(
      screen.getByRole('button', { name: /\+ Add Proof of Application/i })
    );
    const firstDrawer = screen.getByRole('dialog', {
      name: /Add Proof of Application/i,
    });
    await user.click(within(firstDrawer).getByRole('button', { name: 'Batal' }));
    expect(
      screen.queryByRole('dialog', { name: /Add Proof of Application/i })
    ).not.toBeInTheDocument();

    // Open again and submit with Out-of-Range Date Applied (2025-02-20 -> Auto-Rejected per DSN-TBD-04)
    await user.click(
      screen.getByRole('button', { name: /\+ Add Proof of Application/i })
    );
    const secondDrawer = screen.getByRole('dialog', {
      name: /Add Proof of Application/i,
    });

    const secondDateInput = within(secondDrawer).getByLabelText(/Date Applied/i);
    fireEvent.change(secondDateInput, { target: { value: '2025-02-20' } });

    // Out-of-range warning appears immediately in the form
    expect(
      within(secondDrawer).getByText(/Peringatan Rentang Tanggal \(BR-14 & BR-45\)/i)
    ).toBeInTheDocument();

    fireEvent.change(within(secondDrawer).getByLabelText(/Role Applied/i), {
      target: { value: 'UX Engineer' },
    });
    fireEvent.change(within(secondDrawer).getByLabelText(/Company Name/i), {
      target: { value: 'Bank Mandiri' },
    });
    fireEvent.change(within(secondDrawer).getByLabelText(/Company Location/i), {
      target: { value: 'Jakarta Selatan' },
    });
    await user.selectOptions(
      within(secondDrawer).getByLabelText(/Position/i),
      'Full-time'
    );
    fireEvent.change(within(secondDrawer).getByLabelText(/Years of Experience/i), {
      target: { value: '1 Tahun' },
    });
    await user.selectOptions(
      within(secondDrawer).getByLabelText(/Job Level/i),
      'Junior Level'
    );
    await user.selectOptions(
      within(secondDrawer).getByLabelText(/Work System/i),
      'Onsite'
    );
    fireEvent.change(within(secondDrawer).getByLabelText(/Link Job Vacancy/i), {
      target: { value: 'https://mandiri.co.id/careers/ux-engineer' },
    });
    await user.upload(
      within(secondDrawer).getByLabelText(/Upload Proof of Application/i),
      new File(['mandiri-proof'], 'mandiri_proof.png', { type: 'image/png' })
    );

    await user.click(
      within(secondDrawer).getByRole('button', { name: /Submit Bukti Lamaran/i })
    );

    expect(screen.getByText('Bank Mandiri')).toBeInTheDocument();
    expect(screen.getByText('mandiri_proof.png')).toBeInTheDocument();
    expect(
      screen.getByText(/otomatis berstatus Rejected karena Date Applied/i)
    ).toBeInTheDocument();
  });
});


