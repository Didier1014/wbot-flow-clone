import { Header } from '../header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function HeaderExample() {
  return (
    <SidebarProvider>
      <div className="w-full">
        <Header 
          workspaceName="Marketing Digital"
          userName="João Silva"
          status="active"
        />
      </div>
    </SidebarProvider>
  );
}
