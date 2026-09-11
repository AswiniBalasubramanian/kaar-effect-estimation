import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, DM_Sans } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { AssistantDock } from "@/components/assistant-dock";
import { FontPreferenceSync } from "@/components/font-preference-sync";
import { ThemePreferenceSync } from "@/components/theme-preference-sync";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectsProvider } from "@/lib/projects-context";
import { TopBarContentProvider } from "@/lib/top-bar-context";
import { AssistantProvider } from "@/lib/assistant-context";

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

const dmSans = DM_Sans({
  variable: "--font-dm-sans-sans",
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
      data-font="dm-sans"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${figtree.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem("kee-theme-preference")||"light";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}}catch(e){}})();`,
          }}
        />
        <FontPreferenceSync />
        <ThemePreferenceSync />
        <TooltipProvider delayDuration={200}>
          <ProjectsProvider>
            <TopBarContentProvider>
              <AssistantProvider>
                <SidebarProvider
                  className="h-svh flex-col overflow-hidden"
                  style={{ "--sidebar-width": "12rem" } as CSSProperties}
                >
                  <TopBar />
                  <div className="flex min-h-0 flex-1">
                    <AppSidebar />
                    {children}
                    <AssistantDock />
                  </div>
                </SidebarProvider>
              </AssistantProvider>
            </TopBarContentProvider>
          </ProjectsProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
