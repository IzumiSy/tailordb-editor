"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UnauthorizedError } from "./api";

export const getAuth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("patToken");
  if (!token || !token.value) {
    redirect("/auth");
  }

  return {
    patToken: token.value,
  };
};

export const withErrorRedirection = async <R>(fn: () => Promise<R>) => {
  try {
    return await fn();
  } catch (e: unknown) {
    if (e instanceof UnauthorizedError) {
      redirect("/auth/revoke");
    }
    console.error(e);
    throw e;
  }
};
