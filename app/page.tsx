"use client"
import AuthenticatorFragment from "./auth/page";
import AssitantFragmeent from "./fragments/ui/assistant";

export default function Home() {
  return (
    <AuthenticatorFragment>
      <AssitantFragmeent />
    </AuthenticatorFragment>
  );
}
