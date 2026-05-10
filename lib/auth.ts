import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const thirtyDays = 60 * 60 * 24 * 30;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: thirtyDays,
    updateAge: 60 * 60 * 24,
  },
  jwt: {
    maxAge: thirtyDays,
  },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        return ok ? { id: user.id, email: user.email, name: user.name ?? 'Admin' } : null;
      },
    }),
  ],
};
