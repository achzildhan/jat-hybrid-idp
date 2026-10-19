import React, { createContext, useContext, useEffect, useState } from 'react';
import { batchRepository } from '../services/batchRepository';
import type { PrototypeActorRole, StudentIdentity } from '../types/jat';

export interface StudentPrototypeContextValue {
  selectedStudentId: string;
  setSelectedStudentId: (studentId: string) => void;
  selectedStudent: StudentIdentity | undefined;
  referenceDate: string;
  setReferenceDate: (isoDate: string) => void;
  directoryStudents: StudentIdentity[];
  actorRole: PrototypeActorRole;
  setActorRole: (role: PrototypeActorRole) => void;
}

const DEFAULT_STUDENT_ID = 'stu-1';
const DEFAULT_REFERENCE_DATE = '2025-03-10';
const DEFAULT_ACTOR_ROLE: PrototypeActorRole = 'Admin (Talent Support)';

const StudentPrototypeContext = createContext<StudentPrototypeContextValue | undefined>(
  undefined
);

export interface StudentPrototypeProviderProps {
  children: React.ReactNode;
  initialStudentId?: string;
  initialReferenceDate?: string;
  initialActorRole?: PrototypeActorRole;
}

/**
 * EP-JAT-03 & EP-JAT-11 Prototype Context:
 * Provides an explicit synthetic Student selector, simulated reference date selector,
 * and simulated actor role switcher (Admin / Super Admin / Student) so access boundaries,
 * batch access, and date boundaries can be verified without inventing a real authentication backend.
 */
export const StudentPrototypeProvider: React.FC<StudentPrototypeProviderProps> = ({
  children,
  initialStudentId = DEFAULT_STUDENT_ID,
  initialReferenceDate = DEFAULT_REFERENCE_DATE,
  initialActorRole = DEFAULT_ACTOR_ROLE,
}) => {
  const [selectedStudentId, setSelectedStudentIdState] = useState<string>(initialStudentId);
  const [referenceDate, setReferenceDate] = useState<string>(initialReferenceDate);
  const [actorRole, setActorRoleState] = useState<PrototypeActorRole>(initialActorRole);

  // Synchronize active session state in batchRepository
  useEffect(() => {
    batchRepository.setActiveRole(actorRole);
  }, [actorRole]);

  useEffect(() => {
    batchRepository.setActiveStudentId(selectedStudentId);
  }, [selectedStudentId]);

  const setSelectedStudentId = (studentId: string) => {
    setSelectedStudentIdState(studentId);
    batchRepository.setActiveStudentId(studentId);
  };

  const setActorRole = (role: PrototypeActorRole) => {
    setActorRoleState(role);
    batchRepository.setActiveRole(role);
  };

  const directoryStudents = batchRepository.listDirectoryStudents();
  const selectedStudent =
    directoryStudents.find((s) => s.id === selectedStudentId) ?? directoryStudents[0];

  return (
    <StudentPrototypeContext.Provider
      value={{
        selectedStudentId,
        setSelectedStudentId,
        selectedStudent,
        referenceDate,
        setReferenceDate,
        directoryStudents,
        actorRole,
        setActorRole,
      }}
    >
      {children}
    </StudentPrototypeContext.Provider>
  );
};

export function useStudentPrototype(): StudentPrototypeContextValue {
  const ctx = useContext(StudentPrototypeContext);
  if (!ctx) {
    throw new Error('useStudentPrototype must be used within a StudentPrototypeProvider');
  }
  return ctx;
}
