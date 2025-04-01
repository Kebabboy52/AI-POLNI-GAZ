import React, { useState } from 'react';
import type { DepartmentType } from '@/types';
import { DepartmentNode } from './DepartmentNode';
import { DepartmentDialog } from './DepartmentDialog';
import { useOrganizationStore } from '@/store/organizationStore';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { EmployeeManagementDialog } from '../employee/EmployeeManagementDialog';
import { useToast } from '@/hooks/use-toast';

export function OrganizationStructure() {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useOrganizationStore();
  const { toast } = useToast();

  // Состояние для отслеживания развернутых отделов
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  // Состояния для диалоговых окон
  const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  const [isEmployeeManagementOpen, setIsEmployeeManagementOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<DepartmentType | null>(null);
  const [parentDepartmentId, setParentDepartmentId] = useState<string | null>(null);

  // Обработчики для отделов
  const toggleDepartmentExpand = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
    }
    setExpandedDepartments(newExpanded);
  };

  const handleCreateDepartment = (parentId: string | null = null) => {
    setParentDepartmentId(parentId);
    setCurrentDepartment(null);
    setIsCreateDepartmentOpen(true);
  };

  const handleEditDepartment = (department: DepartmentType) => {
    setCurrentDepartment(department);
    setIsEditDepartmentOpen(true);
  };

  const handleDeleteDepartment = (department: DepartmentType) => {
    if (department.employees.length > 0 || department.childDepartments.length > 0) {
      toast({
        title: 'Невозможно удалить',
        description: 'Отдел содержит сотрудников или подразделения. Сначала удалите их.',
        variant: 'destructive',
      });
      return;
    }

    deleteDepartment(department.id);
    toast({
      title: 'Отдел удален',
      description: `${department.name} был успешно удален.`,
    });
  };

  const handleOpenEmployeeManagement = (department: DepartmentType) => {
    setCurrentDepartment(department);
    setIsEmployeeManagementOpen(true);
  };

  // Рендер дерева отделов
  const renderDepartmentTree = (departments: DepartmentType[], level = 0) => {
    return (
      <div className={`ml-${level > 0 ? 8 : 0} space-y-4 mt-4`}>
        {departments.map((department) => (
          <div key={department.id}>
            <DepartmentNode
              department={department}
              isExpanded={expandedDepartments.has(department.id)}
              onToggleExpand={() => toggleDepartmentExpand(department.id)}
              onEdit={() => handleEditDepartment(department)}
              onDelete={() => handleDeleteDepartment(department)}
              onAddSubdepartment={() => handleCreateDepartment(department.id)}
              onManageEmployees={() => handleOpenEmployeeManagement(department)}
            />

            {/* Рендерим дочерние отделы, если отдел развернут */}
            {expandedDepartments.has(department.id) && department.childDepartments.length > 0 && (
              renderDepartmentTree(department.childDepartments, level + 1)
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Организационная структура</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={() => handleCreateDepartment(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить службу
            </Button>
          </div>

          {departments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Организационная структура пуста. Создайте первый отдел.</p>
            </div>
          ) : (
            renderDepartmentTree(departments)
          )}
        </CardContent>
      </Card>

      {/* Диалоги для создания/редактирования отделов и управления сотрудниками */}
      <DepartmentDialog
        open={isCreateDepartmentOpen}
        onOpenChange={setIsCreateDepartmentOpen}
        parentId={parentDepartmentId}
        mode="create"
      />

      {currentDepartment && (
        <>
          <DepartmentDialog
            open={isEditDepartmentOpen}
            onOpenChange={setIsEditDepartmentOpen}
            department={currentDepartment}
            mode="edit"
          />

          <EmployeeManagementDialog
            open={isEmployeeManagementOpen}
            onOpenChange={setIsEmployeeManagementOpen}
            department={currentDepartment}
          />
        </>
      )}
    </div>
  );
}
