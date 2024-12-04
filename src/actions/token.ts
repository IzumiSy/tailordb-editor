"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const setTokenAction = async (token: string) => {
  const cookieStore = await cookies();

  cookieStore.set("patToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  redirect("/workspace");
};

export const revokeTokenAction = async () => {
  const cookieStore = await cookies();

  cookieStore.delete("patToken");

  redirect("/auth");
};
