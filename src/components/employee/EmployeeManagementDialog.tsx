import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '@radix-ui/react-label';
import { Plus, Upload, Search } from 'lucide-react';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeDialog } from './EmployeeDialog';
import { EmployeeMoveDialog } from './EmployeeMoveDialog';
import { CSVImportDialog } from './CSVImportDialog';
import { useOrganizationStore } from '@/store/organizationStore';
import type { DepartmentType, EmployeeType } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface EmployeeManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: DepartmentType;
}

export function EmployeeManagementDialog({
  open,
  onOpenChange,
  department,
}: EmployeeManagementDialogProps) {
  const { getEmployeeById, deleteEmployee } = useOrganizationStore();
  const { toast } = useToast();

  // Состояние для фильтрации сотрудников
  const [searchTerm, setSearchTerm] = useState('');

  // Состояния для вложенных диалогов
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
  const [isMoveEmployeeOpen, setIsMoveEmployeeOpen] = useState(false);
  const [isImportCSVOpen, setIsImportCSVOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeType | null>(null);

  // Отфильтрованные сотрудники
  const filteredEmployees = department.employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.skills.some((skill) => skill.toLowerCase().includes(searchLower))
    );
  });

  // Обработчики для сотрудников
  const handleCreateEmployee = () => {
    setCurrentEmployee(null);
    setIsCreateEmployeeOpen(true);
  };

  const handleEditEmployee = (employee: EmployeeType) => {
    setCurrentEmployee(employee);
    setIsEditEmployeeOpen(true);
  };

  const handleMoveEmployee = (employee: EmployeeType) => {
    setCurrentEmployee(employee);
    setIsMoveEmployeeOpen(true);
  };

  const handleDeleteEmployee = (employee: EmployeeType) => {
    if (confirm(`Вы уверены, что хотите удалить сотрудника ${employee.name}?`)) {
      deleteEmployee(employee.id);
      toast({
        title: 'Сотрудник удален',
        description: `${employee.name} был успешно удален из отдела.`,
      });
    }
  };

  const handleImportCSV = () => {
    setIsImportCSVOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Управление сотрудниками: {department.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="list" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Список сотрудников</TabsTrigger>
            <TabsTrigger value="add">Добавление сотрудников</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск сотрудников..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="h-[400px] overflow-y-auto pr-2">
              {filteredEmployees.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {filteredEmployees.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      onEdit={() => handleEditEmployee(employee)}
                      onDelete={() => handleDeleteEmployee(employee)}
                      onMove={() => handleMoveEmployee(employee)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <p className="mb-2">
                    {searchTerm
                      ? 'Нет сотрудников, соответствующих поисковому запросу'
                      : 'В этом отделе еще нет сотрудников'}
                  </p>
                  {!searchTerm && (
                    <Button
                      variant="outline"
                      onClick={handleCreateEmployee}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить сотрудника
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-4 mt-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div
                className="border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary transition-colors"
                onClick={handleCreateEmployee}
              >
                <Plus className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-lg font-medium">Добавить сотрудника</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Создать нового сотрудника в отделе
                </p>
              </div>

              <div
                className="border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary transition-colors"
                onClick={handleImportCSV}
              >
                <Upload className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-lg font-medium">Импорт из CSV</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Загрузить список сотрудников из CSV-файла
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>

      {/* Вложенные диалоги */}
      <EmployeeDialog
        open={isCreateEmployeeOpen}
        onOpenChange={setIsCreateEmployeeOpen}
        departmentId={department.id}
        mode="create"
      />

      {currentEmployee && (
        <>
          <EmployeeDialog
            open={isEditEmployeeOpen}
            onOpenChange={setIsEditEmployeeOpen}
            employee={currentEmployee}
            departmentId={department.id}
            mode="edit"
          />

          <EmployeeMoveDialog
            open={isMoveEmployeeOpen}
            onOpenChange={setIsMoveEmployeeOpen}
            employee={currentEmployee}
            currentDepartmentId={department.id}
          />
        </>
      )}

      <CSVImportDialog
        open={isImportCSVOpen}
        onOpenChange={setIsImportCSVOpen}
        departmentId={department.id}
      />
    </Dialog>
  );
}
