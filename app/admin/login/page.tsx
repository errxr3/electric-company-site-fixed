import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { authOptions } from '@/lib/auth';

export default async function Page() {
  if (await getServerSession(authOptions)) redirect('/admin/leads');
  return <LoginForm />;
}
