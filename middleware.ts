export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard", "/swaps", "/chat/:path*", "/admin"],
}
