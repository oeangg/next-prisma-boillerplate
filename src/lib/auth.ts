import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { headers } from "next/headers";
import { nextCookies } from "better-auth/next-js";
import { env } from "process";
// Uncomment jika sudah install nodemailer
// import { sendVerificationEmail, sendResetPasswordEmail } from "./email";

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      const { sendEmail } = await import("./email");
      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set(
        "callbackURL",
        `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign-in?verified=true`,
      );

      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `
                    <div style="font-family: sans-serif; font-size: 16px; color: #333;">
                        <h1>Verify your email address in Your App</h1>
                        <p>Click the link below to verify your email address:</p>
                        <a href="${verificationUrl.toString()}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
                        <p style="margin-top: 20px; font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
                    </div>
                `,
      });
    },
    afterEmailVerification: async (user) => {
      console.log(`✅ Email verified for user: ${user.email}`);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24, // Update session setiap 24 jam
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 menit
    },
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: {
              id: session.userId,
            },
          });
          if (user && !user.emailVerified) {
            throw new Error("Email not verified");
          }
        },
      },
    },
  },

  plugins: [nextCookies()],
});

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}
