import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("patToken");

  if (!token) {
    redirect("/auth");
  }

  redirect("/workspace");
};

export default Page;
