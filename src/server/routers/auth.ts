import z from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const authRouter = router({
  // Endpoint Sign Up dengan Better Auth
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Cek apakah email sudah terdaftar
        const existingUser = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email sudah terdaftar, gunakan email lain",
          });
        }

        // Sign up menggunakan Better Auth
        const result = await auth.api.signUpEmail({
          body: {
            email: input.email,
            password: input.password,
            name: input.name,
          },
          // Headers untuk cookies
          headers: ctx.headers,
        });

        if (!result) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Gagal membuat akun",
          });
        }

        return {
          success: true,
          message: "Akun berhasil dibuat! Silakan cek email untuk verifikasi.",
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            emailVerified: result.user.emailVerified,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Sign up error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi kesalahan saat membuat akun",
        });
      }
    }),

  resendVerificationEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User tidak ditemukan",
          });
        }

        if (user.emailVerified) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email sudah terverifikasi",
          });
        }

        // Kirim ulang email verifikasi
        await auth.api.sendVerificationEmail({
          body: { email: input.email },
          headers: ctx.headers,
        });

        return {
          success: true,
          message: "Email verifikasi berhasil dikirim",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal mengirim email verifikasi",
        });
      }
    }),

  // Endpoint untuk verifikasi email dengan token
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await auth.api.verifyEmail({
          query: {
            token: input.token,
          },
          headers: ctx.headers,
        });

        return {
          success: true,
          message: "Email berhasil diverifikasi",
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token tidak valid atau sudah kadaluarsa",
        });
      }
    }),
  // Endpoint Sign In
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await auth.api.signInEmail({
          body: {
            email: input.email,
            password: input.password,
          },
          headers: ctx.headers,
        });

        if (!result) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email atau password salah",
          });
        }

        return {
          success: true,
          message: "Berhasil login",
          user: result.user,
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Email not verified") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message:
                "Email Anda belum diverifikasi. Silakan cek inbox email Anda.",
            });
          }
        }

        // 2. Tangkap error status 401 (Unauthorized)
        // Kita gunakan pengecekan properti secara aman
        if (typeof error === "object" && error !== null && "status" in error) {
          const status = (error as { status: number }).status;
          if (status === 401) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Email atau password salah",
            });
          }
        }

        // 3. Jika sudah TRPCError, lempar kembali
        if (error instanceof TRPCError) {
          throw error;
        }

        // 4. Default error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi kesalahan pada server",
        });
      }
    }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await auth.api.signOut({
        headers: ctx.headers,
      });

      return {
        success: true,
        message: "Berhasil logout",
      };
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Gagal logout",
      });
    }
  }),
});
