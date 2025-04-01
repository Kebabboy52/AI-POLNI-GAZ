import React from 'react';
import type { DepartmentType } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronDown, ChevronRight, Edit, Plus, Trash2, Users } from 'lucide-react';
import { useOrganizationStore } from '@/store/organizationStore';

interface DepartmentNodeProps {
  department: DepartmentType;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddSubdepartment?: () => void;
  onManageEmployees?: () => void;
}

export function DepartmentNode({
  department,
  isExpanded = false,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddSubdepartment,
  onManageEmployees,
}: DepartmentNodeProps) {
  // Определяем тип (уровень) отдела для отображения
  const getDepartmentTypeLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Служба';
      case 2:
        return 'Отдел';
      case 3:
        return 'Группа';
      default:
        return 'Подразделение';
    }
  };

  // Определяем, можно ли добавлять дочерние отделы (не более 3 уровней вложенности)
  const canAddSubdepartment = department.level < 3;

  return (
    <Card className={`w-full max-w-sm border-2 ${
      department.level === 1
        ? 'border-blue-300'
        : department.level === 2
          ? 'border-green-300'
          : 'border-yellow-300'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{department.name}</CardTitle>
            <CardDescription>
              {getDepartmentTypeLabel(department.level)}
            </CardDescription>
          </div>
          {department.childDepartments.length > 0 && (
            <Button variant="ghost" size="icon" onClick={onToggleExpand}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{department.description}</p>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          <span>{department.employees.length} сотрудников</span>
        </div>
        {department.childDepartments.length > 0 && (
          <div className="text-sm text-muted-foreground mt-1">
            {department.childDepartments.length} подразделений
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-1">
          {canAddSubdepartment && (
            <Button variant="outline" size="icon" onClick={onAddSubdepartment}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={onManageEmployees}>
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
