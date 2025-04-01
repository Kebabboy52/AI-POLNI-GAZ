import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { RequestStatus, type RequestType, RequestTypeEnum } from '@/types';
import { useOrganizationStore } from '@/store/organizationStore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';
import { Label } from '@radix-ui/react-label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface RequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequestType;
}

export function RequestDetailDialog({
  open,
  onOpenChange,
  request,
}: RequestDetailDialogProps) {
  const { departments, updateRequestStatus, assignRequest, addRequestComment } = useOrganizationStore();
  const { toast } = useToast();

  // Состояния
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [assignedDepartmentId, setAssignedDepartmentId] = useState<string>(request.assignedToDepartmentId || '');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Получаем плоский список всех отделов
  const flattenedDepartments = React.useMemo(() => {
    const result: { id: string; name: string; level: number }[] = [];

    const flatten = (departments: any[]) => {
      departments.forEach(dept => {
        result.push({
          id: dept.id,
          name: dept.name,
          level: dept.level,
        });

        if (dept.childDepartments && dept.childDepartments.length > 0) {
          flatten(dept.childDepartments);
        }
      });
    };

    flatten(departments);
    return result;
  }, [departments]);

  // Обработчик обновления статуса
  const handleUpdateStatus = () => {
    setIsSubmitting(true);

    try {
      updateRequestStatus(request.id, status);

      toast({
        title: 'Статус обновлен',
        description: `Статус заявки изменен на ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус заявки.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчик назначения отдела
  const handleAssignDepartment = () => {
    setIsSubmitting(true);

    try {
      assignRequest(request.id, assignedDepartmentId);

      const department = flattenedDepartments.find(d => d.id === assignedDepartmentId);
      toast({
        title: 'Отдел назначен',
        description: `Заявка назначена отделу "${department?.name || 'Неизвестный отдел'}".`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось назначить отдел для заявки.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчик добавления комментария
  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите текст комментария.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      addRequestComment(request.id, commentText, 'system-user'); // TODO: заменить на реального пользователя

      toast({
        title: 'Комментарий добавлен',
        description: 'Ваш комментарий был успешно добавлен к заявке.',
      });

      setCommentText('');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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

  // Получаем имя отдела
  const getDepartmentName = (departmentId: string) => {
    const department = flattenedDepartments.find(d => d.id === departmentId);
    return department?.name || 'Не назначен';
  };

  // Форматируем дату
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Детали заявки: {request.title}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge className={getStatusBadgeColor(request.status)}>
                {request.status}
              </Badge>
              <Badge variant="outline">{getRequestTypeName(request.type)}</Badge>
              <Badge variant="outline" className="bg-slate-50">
                Создано: {formatDate(request.createdAt)}
              </Badge>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Описание:</h3>
              <p className="text-sm whitespace-pre-wrap">{request.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1">Назначено:</h3>
              <p className="text-sm">{getDepartmentName(request.assignedToDepartmentId)}</p>
            </div>
          </div>

          {/* Секция комментариев */}
          <div>
            <h3 className="text-sm font-medium mb-2">Комментарии:</h3>
            {request.comments.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                {request.comments.map((comment) => (
                  <Card key={comment.id} className="p-0">
                    <CardHeader className="p-3 pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-sm">Пользователь</CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">Нет комментариев</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="comment">Добавить комментарий</Label>
              <Textarea
                id="comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Введите комментарий к заявке..."
                rows={3}
              />
              <Button
                type="button"
                onClick={handleAddComment}
                disabled={isSubmitting || !commentText.trim()}
                className="mt-2"
              >
                Добавить комментарий
              </Button>
            </div>
          </div>

          {/* Управление заявкой */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Изменить статус</Label>
              <div className="flex space-x-2">
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as RequestStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(RequestStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isSubmitting || status === request.status}
                >
                  Обновить
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Назначить отдел</Label>
              <div className="flex space-x-2">
                <Select
                  value={assignedDepartmentId}
                  onValueChange={setAssignedDepartmentId}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Выберите отдел" />
                  </SelectTrigger>
                  <SelectContent>
                    {flattenedDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAssignDepartment}
                  disabled={isSubmitting || assignedDepartmentId === request.assignedToDepartmentId || !assignedDepartmentId}
                >
                  Назначить
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
