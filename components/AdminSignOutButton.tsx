'use client';

import { signOut } from 'next-auth/react';

export function AdminSignOutButton() {
  return (
    <button className="btn btn-ghost px-3 py-2 text-sm" onClick={() => signOut({ callbackUrl: '/admin/login' })} type="button">
      Выйти
    </button>
  );
}
