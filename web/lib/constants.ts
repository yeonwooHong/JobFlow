export const JOB_STATUS = {
  NOT_APPLIED: 'NOT APPLIED',
  APPLIED: 'APPLIED',
  INTERVIEWING: 'INTERVIEWING',
  OFFERED: 'OFFERED',
  REJECTED: 'REJECTED',
  ACCEPTED: 'ACCEPTED'
} as const; // 'as const' to make the object readonly

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS]; // Type representing the values of JOB_STATUS