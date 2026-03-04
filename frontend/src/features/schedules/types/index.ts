export interface Employee {
  id: string;
  name: string;
  specialty: string;
}

export interface DaySchedule {
  dayIndex: number;
  startTime: string;
  endTime: string;
}

export interface WeeklySchedule {
  id: number;
  employeeId: string;
  employeeName: string;
  weekStartDate: Date;
  daySchedules: DaySchedule[];
  isActive: boolean;
}

export interface ScheduleFormData {
  employeeId: string;
  daySchedules: DaySchedule[];
}

export interface SchedulesModuleProps {
  userRole: "admin" | "employee" | "client";
}