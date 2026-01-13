"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { trpc } from "../../../app/_trpcClient/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

export const LogoutButton = () => {
  const router = useRouter();
  const logoutMutation = trpc.auth.signOut.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/sign-in");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="w-full cursor-pointer"
    >
      {logoutMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </>
      )}
    </Button>
  );
};
