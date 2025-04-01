import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '@radix-ui/react-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequestStatus, type RequestType, RequestTypeEnum } from '@/types';
import { useOrganizationStore } from '@/store/organizationStore';
import { RequestDetailDialog } from './RequestDetailDialog';
import { Search, Filter } from 'lucide-react';

// Вспомогательная функция для форматирования даты
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Получаем название типа заявки
const getRequestTypeName = (type: RequestTypeEnum) => {
  switch (type) {
    case RequestTypeEnum.IT:
      return 'ИТ-запрос';
    case RequestTypeEnum.HR:
      return 'Кадровый вопрос';
    case RequestTypeEnum.LOGISTICS:
      return 'Запрос логистики';
    default:
      return type;
  }
};

// Получаем цвет статуса заявки
const getStatusBadgeColor = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.NEW:
      return 'bg-blue-100 text-blue-800';
    case RequestStatus.IN_PROGRESS:
      return 'bg-yellow-100 text-yellow-800';
    case RequestStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    case RequestStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function RequestList() {
  const { requests, departments } = useOrganizationStore();

  // Состояния для фильтрации и поиска
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<RequestTypeEnum | 'ALL'>('ALL');

  // Состояние для детального просмотра заявки
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Фильтрация заявок
  const filteredRequests = requests.filter((request) => {
    // Фильтр по статусу
    if (statusFilter !== 'ALL' && request.status !== statusFilter) {
      return false;
    }

    // Фильтр по типу
    if (typeFilter !== 'ALL' && request.type !== typeFilter) {
      return false;
    }

    // Поиск по тексту
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.title.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Находим название отдела по его ID
  const getDepartmentName = (departmentId: string) => {
    // Плоский список всех отделов
    const getAllDepartments = (departments: any[]): any[] => {
      return departments.reduce((acc, dept) => {
        return [...acc, dept, ...getAllDepartments(dept.childDepartments)];
      }, []);
    };

    const allDepartments = getAllDepartments(departments);
    const department = allDepartments.find((dept) => dept.id === departmentId);
    return department ? department.name : 'Не назначен';
  };

  // Открыть диалог с детальной информацией
  const handleOpenDetail = (request: RequestType) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Список заявок</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search">Поиск</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Поиск по заголовку или описанию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="w-full sm:w-48 space-y-2">
            <Label htmlFor="status-filter">Статус</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as RequestStatus | 'ALL')}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Все статусы</SelectItem>
                {Object.values(RequestStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48 space-y-2">
            <Label htmlFor="type-filter">Тип</Label>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as RequestTypeEnum | 'ALL')}
            >
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Все типы</SelectItem>
                {Object.values(RequestTypeEnum).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getRequestTypeName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Нет заявок, соответствующих критериям поиска и фильтрации</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Заголовок</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Отдел</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-xs">
                      {request.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>{getRequestTypeName(request.type)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getDepartmentName(request.assignedToDepartmentId)}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetail(request)}
                      >
                        Подробнее
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Диалог с детальной информацией о заявке */}
      {selectedRequest && (
        <RequestDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          request={selectedRequest}
        />
      )}
    </Card>
  );
}
