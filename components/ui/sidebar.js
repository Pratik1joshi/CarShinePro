"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Sidebar({ className = "", children }) {
  return (
    <aside className={cn("flex flex-col bg-white shadow-lg h-full w-64 shrink-0 relative", className)}>
      {children}
    </aside>
  )
}

/* ----------- sub-components ------------ */

function Nav({ className = "", children }) {
  return <nav className={cn("flex-1 p-4 space-y-2 overflow-y-auto", className)}>{children}</nav>
}

function NavItem({ href, children, className = "" }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
        isActive ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100",
        className,
      )}
    >
      {children}
    </Link>
  )
}

/* expose as static properties */
Sidebar.Nav = Nav
Sidebar.NavItem = NavItem
