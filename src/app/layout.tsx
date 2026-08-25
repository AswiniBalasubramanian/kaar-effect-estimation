import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { FontPreferenceSync } from "@/components/font-preference-sync";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectsProvider } from "@/lib/projects-context";
import { TopBarContentProvider } from "@/lib/top-bar-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KaarTech Effort Estimator",
  description:
    "SAP S/4HANA pre-sales engagements estimated with the Kaar Delivery Methodology",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-font="geist"
      className={`${geistSans.variable} ${geistMono.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <FontPreferenceSync />
        <TooltipProvider delayDuration={200}>
          <ProjectsProvider>
            <TopBarContentProvider>
              <SidebarProvider
                className="h-svh flex-col overflow-hidden"
                style={{ "--sidebar-width": "12rem" } as CSSProperties}
              >
                <TopBar />
                <div className="flex min-h-0 flex-1">
                  <AppSidebar />
                  {children}
                </div>
              </SidebarProvider>
            </TopBarContentProvider>
          </ProjectsProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
