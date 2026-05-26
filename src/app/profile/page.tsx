'use client';

import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components';
import { Navbar } from '@/components/Navbar';
import { ProfileDisplay } from './ProfileDisplay';

function ProfileContent() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <ProfileDisplay user={user} />
    </>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
