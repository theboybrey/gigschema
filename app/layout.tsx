import NotifierContainer from "@/components/notifier";
import { configurations } from "@/configurations";
import StateProvider from "@/global/state.provider";
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from "next";
import ConnectionListener from "./fragments/ui/connector";
import "./globals.css";


export const metadata: Metadata = {
  title: `${configurations.title.default}`,
  description: `Premier Organization-wide asset management and auction platform powered and engineered by Polymorph Labs.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <StateProvider>
          <NotifierContainer />
          <ConnectionListener />
          {children}
        </StateProvider>
      </body>
    </html>
  );
}
