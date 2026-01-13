// Di page atau component lain

import { Metadata } from "next";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Register ",
  description: "Register akun",
};

export default function Home() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <SignUpForm />
    </div>
  );
}
