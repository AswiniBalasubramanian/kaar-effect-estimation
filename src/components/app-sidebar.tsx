"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  SquaresFour,
  BookOpen,
  SlidersHorizontal,
  Star,
} from "@phosphor-icons/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/lib/projects-context";
import {
  setFontPreference,
  useFontPreference,
  type FontPreference,
} from "@/hooks/use-font-preference";
import {
  setThemePreference,
  useThemePreference,
  type ThemePreference,
} from "@/hooks/use-theme-preference";

const navLinks = [
  { label: "Projects", href: "/", icon: Folder },
  { label: "Configuration", href: "/configuration", icon: SlidersHorizontal },
  { label: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { label: "Glossary", href: "/glossary", icon: BookOpen },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { starredProjects } = useProjects();
  const fontPreference = useFontPreference();
  const themePreference = useThemePreference();

  return (
    <Sidebar
      collapsible="icon"
      className="top-12 h-[calc(100svh-3rem)]"
    >
      <SidebarContent>
        <nav aria-label="Main">
        <SidebarGroup className="pt-3">
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={link.label}
                    >
                      <Link href={link.href}>
                        <link.icon />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </nav>

        {starredProjects.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Starred</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {starredProjects.map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton asChild tooltip={project.name}>
                        <Link href={`/projects/${project.id}`}>
                          <Star className="fill-current" />
                          <span>{project.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Aswini"
                  className="bg-white hover:bg-white dark:bg-neutral-900 dark:hover:bg-neutral-900"
                >
                  <Avatar className="h-6 w-6 border border-sidebar-border">
                    <AvatarFallback className="bg-sidebar-primary/15 text-xs font-medium text-sidebar-primary">
                      A
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex flex-col leading-tight">
                    <span className="text-sm font-medium">Aswini</span>
                    <span className="text-xs text-sidebar-foreground/70">
                      Presales
                    </span>
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Aswini</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Presales
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/configuration">Configuration</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/glossary">Glossary</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Appearance</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        Theme
                      </DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={themePreference}
                        onValueChange={(value) =>
                          setThemePreference(value as ThemePreference)
                        }
                      >
                        <DropdownMenuRadioItem value="light">
                          Light
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dark">
                          Dark
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">
                          System
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        Font
                      </DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={fontPreference}
                        onValueChange={(value) =>
                          setFontPreference(value as FontPreference)
                        }
                      >
                        <DropdownMenuRadioItem value="geist">
                          Geist
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="figtree">
                          Figtree
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dm-sans">
                          DM Sans
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
