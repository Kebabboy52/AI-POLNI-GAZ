import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationStructure } from '@/components/department/OrganizationStructure';
import { RequestList } from '@/components/request/RequestList';
import { RequestForm } from '@/components/request/RequestForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganizationStore } from '@/store/organizationStore';
import { RequestTypeEnum } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { AIOrganizationOptimizer } from '@/components/ai/AIOrganizationOptimizer';

// Клиентский компонент для главной страницы (требуется для использования хуков)
import ClientPage from './client-page';

export default function Home() {
  return <ClientPage />;
}
