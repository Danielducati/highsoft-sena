import { useState } from "react";
import { toast } from "sonner";
import { WeeklySchedule, ScheduleFormData, Employee } from "../types";
import { getMondayOfWeek, getWeekDays } from "../utils";
import { WEEK_DAYS_LABELS } from "../constants";

const DEFAULT_WEEK = getMondayOfWeek(new Date(2025, 10, 17));
const EMPTY_FORM: ScheduleFormData = { employeeId: "", daySchedules: [] };

// Lista de empleados — reemplazar con fetch a la API cuando esté disponible
const EMPLOYEES: Employee[] = [];

export function useSchedules() {
  const [schedules,       setSchedules]       = useState<WeeklySchedule[]>([]);
  const [isDialogOpen,    setIsDialogOpen]    = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WeeklySchedule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [filterEmployee,  setFilterEmployee]  = useState("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<WeeklySchedule | null>(null);
  const [formWeekStart,   setFormWeekStart]   = useState<Date>(DEFAULT_WEEK);
  const [formData,        setFormData]        = useState<ScheduleFormData>(EMPTY_FORM);

  // ── Semana en el formulario ────────────────────────────────────────────────
  const goToPreviousWeek = () => {
    const d = new Date(formWeekStart);
    d.setDate(d.getDate() - 7);
    setFormWeekStart(d);
  };

  const goToNextWeek = () => {
    const d = new Date(formWeekStart);
    d.setDate(d.getDate() + 7);
    setFormWeekStart(d);
  };

  // ── Días en el formulario ──────────────────────────────────────────────────
  const toggleDay = (dayIndex: number) => {
    const exists = formData.daySchedules.some(ds => ds.dayIndex === dayIndex);
    setFormData(prev => ({
      ...prev,
      daySchedules: exists
        ? prev.daySchedules.filter(ds => ds.dayIndex !== dayIndex)
        : [...prev.daySchedules, { dayIndex, startTime: "", endTime: "" }],
    }));
  };

  const updateDaySchedule = (dayIndex: number, field: "startTime" | "endTime", value: string) => {
    setFormData(prev => ({
      ...prev,
      daySchedules: prev.daySchedules.map(ds =>
        ds.dayIndex === dayIndex ? { ...ds, [field]: value } : ds
      ),
    }));
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreateOrUpdate = () => {
    if (!formData.employeeId || formData.daySchedules.length === 0) {
      toast.error("Por favor completa todos los campos y selecciona al menos un día");
      return;
    }
    for (const ds of formData.daySchedules) {
      if (!ds.startTime || !ds.endTime) {
        toast.error("Por favor completa todos los horarios");
        return;
      }
      if (ds.startTime >= ds.endTime) {
        const dayLabel = WEEK_DAYS_LABELS[ds.dayIndex]?.label || "día";
        toast.error(`La hora de inicio debe ser menor a la hora de fin en ${dayLabel}`);
        return;
      }
    }

    const employee = EMPLOYEES.find(e => e.id === formData.employeeId);
    if (!employee) return;

    if (editingSchedule) {
      setSchedules(prev => prev.map(s =>
        s.id === editingSchedule.id
          ? { ...s, employeeId: formData.employeeId, employeeName: employee.name, weekStartDate: formWeekStart, daySchedules: formData.daySchedules }
          : s
      ));
      toast.success("Horario actualizado exitosamente");
    } else {
      const newSchedule: WeeklySchedule = {
        id:            Math.max(...schedules.map(s => s.id), 0) + 1,
        employeeId:    formData.employeeId,
        employeeName:  employee.name,
        weekStartDate: formWeekStart,
        daySchedules:  formData.daySchedules,
        isActive:      true,
      };
      setSchedules(prev => [...prev, newSchedule]);
      toast.success("Horario creado exitosamente");
    }
    resetForm();
  };

  const handleDelete = () => {
    if (!scheduleToDelete) return;
    setSchedules(prev => prev.filter(s => s.id !== scheduleToDelete));
    toast.success("Horario eliminado");
    setDeleteDialogOpen(false);
    setScheduleToDelete(null);
  };

  const confirmDelete = (id: number) => {
    setScheduleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (schedule: WeeklySchedule) => {
    setEditingSchedule(schedule);
    setFormWeekStart(schedule.weekStartDate);
    setFormData({ employeeId: schedule.employeeId, daySchedules: [...schedule.daySchedules] });
    setIsDialogOpen(true);
  };

  const handleViewDetail = (schedule: WeeklySchedule) => {
    setViewingSchedule(schedule);
    setDetailDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setFormWeekStart(DEFAULT_WEEK);
    setFormData(EMPTY_FORM);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterEmployee("all");
  };

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filteredSchedules = schedules
    .filter(s => s.isActive)
    .filter(s => filterEmployee === "all" || s.employeeId === filterEmployee)
    .filter(s => !searchTerm || s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

  const formWeekDays = getWeekDays(formWeekStart);

  return {
    schedules, filteredSchedules,
    employees: EMPLOYEES,
    isDialogOpen, setIsDialogOpen,
    editingSchedule,
    deleteDialogOpen, setDeleteDialogOpen,
    detailDialogOpen, setDetailDialogOpen,
    viewingSchedule,
    searchTerm, setSearchTerm,
    filterEmployee, setFilterEmployee,
    formWeekStart, formData, setFormData,
    formWeekDays,
    goToPreviousWeek, goToNextWeek,
    toggleDay, updateDaySchedule,
    handleCreateOrUpdate, handleDelete,
    confirmDelete, handleEdit, handleViewDetail,
    resetForm, clearFilters,
  };
}