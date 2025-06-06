import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function HomePage() {
  const session = await auth()
  
  if (session) {
    // Authenticated users go to dashboard
    redirect("/dashboard")
  } else {
    // Unauthenticated users go to public landing page
    // For now, redirect to signin until we set up proper route handling
    redirect("/signin")
  }
}
