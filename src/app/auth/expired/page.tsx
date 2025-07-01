"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ExpiredPage() {
  useEffect(() => {
    localStorage.removeItem("authToken");
    signOut();
    setTimeout(() => {
      redirect("/home");
    }, 4000);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sesión expirada</h1>
      <p>Tu sesión ha expirado. Redirigiendo al inicio...</p>
    </div>
  );
}
