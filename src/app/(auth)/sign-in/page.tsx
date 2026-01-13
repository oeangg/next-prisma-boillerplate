import { Metadata } from "next";
import { SignInForm } from "./sign-in-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login ",
  description: "Login ke akun  Anda",
};

export default function SignInPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
