export interface Child {
  id: number;
  name: string;
  gradeLabel: string;
  grade: number | null;
  schoolName: string | null;
  siblingOrder: number;
}

export interface Slot {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface ParentEnrollment {
  id: number;
  status: '신청됨' | '수강중' | '환불요청' | '수강종료' | '거절' | '취소';
  startDate: string;
  endDate: string | null;
  refundAmount: number | null;
  appliedOn: string;
  byPhone: boolean;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  monthlyFee: number;
  schedules: Slot[];
}
