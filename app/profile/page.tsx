import AppLayout from '@/components/layout/app-layout';
import ProfileForm from '@/components/profile/profile-form';

export default function ProfilePage() {
  return (
    <AppLayout title="Profile">
      <ProfileForm />
    </AppLayout>
  );
}