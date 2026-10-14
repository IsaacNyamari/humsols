import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <>
      <h1 className="mb-6 text-xl">Sign in to the admin</h1>
      <Suspense fallback={<LoginForm />}>
        <LoginWithParams searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function LoginWithParams({
  searchParams,
}: {
  searchParams: PageProps<"/admin/login">["searchParams"];
}) {
  const { next, reset } = await searchParams;
  return (
    <LoginForm
      next={typeof next === "string" ? next : undefined}
      notice={reset ? "Your password has been set. Sign in with your new password." : undefined}
    />
  );
}
