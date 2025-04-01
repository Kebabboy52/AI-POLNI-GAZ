'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationStructure } from '@/components/department/OrganizationStructure';
import { RequestList } from '@/components/request/RequestList';
import { RequestForm } from '@/components/request/RequestForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganizationStore } from '@/store/organizationStore';
import { RequestTypeEnum } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { AIOrganizationOptimizer } from '@/components/ai/AIOrganizationOptimizer';
import { TopEmployees } from '@/components/ai/TopEmployees';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { LogIn, LogOut } from 'lucide-react';

export default function ClientPage() {
  const { addRequest, getCurrentUser, logoutUser } = useOrganizationStore();
  const { toast } = useToast();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('structure');

  const currentUser = getCurrentUser();

  // Обработчик создания заявки
  const handleCreateRequest = (values: { title: string; description: string; type: RequestTypeEnum }) => {
    try {
      const userId = currentUser?.id || 'system-user';

      const newRequest = addRequest(
        values.title,
        values.description,
        values.type,
        userId
      );

      toast({
        title: 'Заявка создана',
        description: 'Ваша заявка была успешно создана и отправлена в обработку.',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заявку. Пожалуйста, попробуйте еще раз.',
        variant: 'destructive',
      });
    }
  };

  const handleLoginClick = () => {
    setIsAuthDialogOpen(true);
  };

  const handleLogoutClick = () => {
    logoutUser();
    toast({
      title: 'Выход из системы',
      description: 'Вы успешно вышли из аккаунта',
    });
  };

  const handleAuthDialogClose = () => {
    setIsAuthDialogOpen(false);
  };

  return (
    <main className="container px-4 py-6 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">ИИ-конструктор организационной структуры</h1>
          <p className="text-muted-foreground">
            Управление отделами, сотрудниками и автоматизированная обработка заявок
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <div className="text-sm mr-2">
                Привет, <span className="font-semibold">{currentUser.firstName || currentUser.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogoutClick}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleLoginClick}>
              <LogIn className="h-4 w-4 mr-2" />
              Войти
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 max-w-2xl">
          <TabsTrigger value="structure">Структура</TabsTrigger>
          <TabsTrigger value="requests">Заявки</TabsTrigger>
          <TabsTrigger value="create-request">Создать заявку</TabsTrigger>
          <TabsTrigger value="ai-optimization">AI-оптимизация</TabsTrigger>
          <TabsTrigger value="top-employees">Топ сотрудников</TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4">
          <OrganizationStructure />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <RequestList />
        </TabsContent>

        <TabsContent value="create-request" className="space-y-4">
          <RequestForm onCreate={handleCreateRequest} />
        </TabsContent>

        <TabsContent value="ai-optimization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AIOrganizationOptimizer />
          </div>
        </TabsContent>

        <TabsContent value="top-employees" className="space-y-4">
          <TopEmployees />
        </TabsContent>
      </Tabs>

      <AuthDialog isOpen={isAuthDialogOpen} onClose={handleAuthDialogClose} />
      <Toaster />
    </main>
  );
}
