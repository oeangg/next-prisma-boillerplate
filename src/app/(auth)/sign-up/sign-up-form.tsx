"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

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
import {
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// Schema validasi yang sama dengan backend
const signUpSchema = z
  .object({
    email: z.string().email("Email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
      .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
    name: z.string().min(2, "Nama minimal 2 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export const SignUpForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    },
  });

  // Mutation untuk sign up
  const signUpMutation = trpc.auth.signUp.useMutation({
    onSuccess: (data) => {
      setIsSuccess(true);
      toast.success(data.message);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: SignUpFormValues) => {
    signUpMutation.mutate({
      email: data.email,
      password: data.password,
      name: data.name,
    });
  };

  // Tampilan success
  if (isSuccess) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-green-700">
            Akun Berhasil Dibuat!
          </CardTitle>
          <CardDescription>
            Silakan cek email Anda untuk verifikasi
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          <p>Kami telah mengirimkan link verifikasi ke email Anda.</p>
          <p className="mb-4">
            Klik link tersebut untuk mengaktifkan akun Anda.
          </p>
          <div className="bg-muted rounded-lg px-30 py-4 text-left text-sm">
            <p className="mb-2 font-medium">Tidak menerima email?</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Cek folder spam/junk</li>
              <li>• Link valid selama 24 jam</li>
              <li>• Tunggu beberapa menit</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/sign-in" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Buat Akun Baru</CardTitle>
        <CardDescription>
          Isi form di bawah untuk membuat akun Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="John Doe"
                        className="pl-10"
                        disabled={signUpMutation.isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10"
                        disabled={signUpMutation.isPending}
                      />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        disabled={signUpMutation.isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground mt-1 text-xs">
                    Minimal 8 karakter, mengandung huruf besar, kecil, dan angka
                  </p>
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        disabled={signUpMutation.isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={signUpMutation.isPending}
            >
              {signUpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat akun...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-muted-foreground text-center text-sm">
          Sudah punya akun?{" "}
          <a href="/sign-in" className="text-primary hover:underline">
            Masuk di sini
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};
