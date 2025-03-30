"use client"
import { AuthenticatorFragment } from "./auth/fragments/guard";
import AssitantFragmeent from "./fragments/ui/assistant";

export default function Home() {
  return (
    <AuthenticatorFragment>
      <AssitantFragmeent />
    </AuthenticatorFragment>
  );
}
