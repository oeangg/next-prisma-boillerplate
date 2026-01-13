"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { trpc } from "@/app/_trpcClient/client";
import { toast } from "sonner";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

// Schema validasi sesuai dengan backend
const signInSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export const SignInForm = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified") === "true";

  useEffect(() => {
    if (isVerified) {
      // Gunakan setTimeout kecil untuk memastikan DOM & Toaster sudah siap
      const timer = setTimeout(() => {
        console.log("Verified status:", isVerified);
        toast.success("Email berhasil diverifikasi! Silakan login.");

        // Opsional: Hapus query param dari URL agar jika di-refresh toast tidak muncul lagi
        router.replace("/sign-in");
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVerified, router]);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Mutation untuk sign in
  const signInMutation = trpc.auth.signIn.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      form.reset();

      // Redirect ke dashboard
      router.push("/dashboard");
    },
    onError: (error) => {
      // Cek apakah error karena email belum diverifikasi
      if (
        error.message.includes("verifikasi") ||
        error.message.includes("verify")
      ) {
        //   toast.error(error.message, {
        //     action: {
        //       label: "Kirim Ulang",
        //       onClick: () => {
        //         router.push(
        //           `/verify-email-sent?email=${form.getValues("email")}`,
        //         );
        //       },
        //     },
        //   });
        // } else {
        toast.error(error.message);
      }
    },
  });

  const onSubmit = (data: SignInFormValues) => {
    signInMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Masukkan email dan password Anda untuk login
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10"
                        disabled={signInMutation.isPending}
                        autoComplete="email"
                      />
                      <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-primary text-sm hover:underline"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        disabled={signInMutation.isPending}
                        autoComplete="current-password"
                      />
                      <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember Me & Show Password */}
            <div className="flex items-center justify-end gap-2"></div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={signInMutation.isPending}
            >
              {signInMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </Form>

        {/* Error Alert - jika ada error umum */}
        {signInMutation.isError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Login gagal</p>
              <p className="mt-1 text-xs">
                Periksa kembali email dan password Anda
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              Atau
            </span>
          </div>
        </div>

        <div className="text-muted-foreground text-center text-sm">
          Belum punya akun?{" "}
          <Link
            href="/sign-up"
            className="text-primary font-medium hover:underline"
          >
            Daftar di sini
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
