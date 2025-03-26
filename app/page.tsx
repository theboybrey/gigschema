import Image from "next/image";
import AuthenticatorFragment from "./auth/page";

export default function Home() {
  return (
    <AuthenticatorFragment>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Image src="/logo.svg" alt="logo" width={300} height={300} />
        <h1 className="text-6xl font-bold">
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
      </div>
    </AuthenticatorFragment>
  );
}
