'use client';

import { signOut } from 'next-auth/react';

export function AdminSignOutButton() {
  return (
    <button className="btn btn-ghost" onClick={() => signOut({ callbackUrl: '/admin/login' })} type="button">
      Выйти
    </button>
  );
}
