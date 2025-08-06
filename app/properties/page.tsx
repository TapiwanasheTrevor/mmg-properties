import AppLayout from '@/components/layout/app-layout';
import PropertyList from '@/components/properties/property-list';

export default function PropertiesPage() {
  return (
    <AppLayout 
      title="Properties"
      requiredRoles={['admin', 'owner', 'agent']}
    >
      <PropertyList />
    </AppLayout>
  );
}