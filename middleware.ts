import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)',"/", "/sign-up(.*)", "/api/stripe", "/api/webhook", "/api/upload-and-create-chat","/api/create-chat-for-mobile","/api/get-messages","/api/save-message","/api/get-chats","/api/chat_mobile"])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}