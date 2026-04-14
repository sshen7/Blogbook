import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-request",
    newUser: "/signup",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.FROM_EMAIL,
      maxAge: 60 * 60, // 1 hour
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // 这里应该使用适当的密码验证方法
        // const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        // if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.theme = token.theme as string;
        session.user.fontSize = token.fontSize as string;
        session.user.lineHeight = token.lineHeight as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      if (account?.provider === "google" || account?.provider === "github") {
        token.provider = account.provider;
      }

      // 获取用户详细信息
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: token.email,
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            theme: true,
            fontSize: true,
            lineHeight: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
          token.theme = dbUser.theme;
          token.fontSize = dbUser.fontSize;
          token.lineHeight = dbUser.lineHeight;
        }
      }

      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    encryption: true,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  events: {
    async signIn(message) {
      console.log("Sign in event:", message);
    },
    async signOut(message) {
      console.log("Sign out event:", message);
    },
    async session(message) {
      console.log("Session event:", message);
    },
  },
  theme: {
    colorScheme: "auto",
  },
  trustHost: true,
});
