import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { checkSubscription } from "@/lib/subscription";
import SubscriptionButton from "@/components/SubscriptionButton";
import { FaAndroid } from "react-icons/fa";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = Boolean(userId);
  let firstChat = null;
  if (isAuth) {
    const chatsData = await db.select().from(chats).where(eq(chats.userId, userId as string));
    firstChat = chatsData?.[0] || null;
  }
  const isPro = await checkSubscription();

  return (
    <div className="w-screen min-h-screen relative bg-[#0D1117] overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117] via-[#161B22] to-[#0D1117] animate-gradient"></div>
      
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
      >
        <source src="/videos/Gen-2 1463179644, move the lock and th, Default_Create_a_mes, M 10.mp4" type="video/mp4" />
      </video>

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF9D]/20 rounded-full blur-[128px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#39FF14]/20 rounded-full blur-[128px] animate-pulse-slow delay-1000"></div>

      {/* Logo */}
      <div className="absolute top-6 left-6 z-20">
        <Image
          src="/images/lock-removebg-preview.png"
          alt="Logo"
          width={56}
          height={72}
          className="drop-shadow-[0_0_15px_rgba(0,255,157,0.3)]"
        />
      </div>

      {/* User Button */}
      <div className="absolute top-6 right-6 z-20">
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Floating Elements */}
        <div className="absolute -left-20 top-1/3 w-24 h-24 bg-gradient-to-r from-[#00FF9D] to-[#39FF14] opacity-20 rounded-xl rotate-45 animate-float-slow backdrop-blur-md"></div>
        <div className="absolute -right-20 bottom-1/3 w-20 h-20 bg-gradient-to-r from-[#39FF14] to-[#00FF9D] opacity-20 rounded-xl rotate-12 animate-float-delay backdrop-blur-md"></div>

        {/* Content Container */}
        <div className="max-w-5xl w-full px-4">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block">
              <span className="bg-gradient-to-r from-[#00FF9D] to-[#39FF14] text-transparent bg-clip-text text-lg font-medium tracking-wider px-4 py-2 rounded-full border border-[#00FF9D]/20 backdrop-blur-sm">
                Powered by LOCK
              </span>
            </div>
            <h1 className="text-7xl font-bold text-white mt-6 mb-8 leading-tight">
              A Talk with My{" "}
              <span className="bg-gradient-to-r from-[#00FF9D] to-[#39FF14] text-transparent bg-clip-text">
                PDF
              </span>
            </h1>
            <p className="text-[#A3B3BC] text-xl max-w-2xl mx-auto leading-relaxed font-light">
              Join millions of students, researchers and professionals to instantly
              answer questions and understand research with AI
            </p>
          </div>

          {/* Action Section */}
          <div className="max-w-md mx-auto space-y-6">
            {isAuth && firstChat && (
              <div className="flex gap-3">
                <Link href={`/chat/${firstChat.id}`} className="flex-1">
                  <Button className="w-full bg-[#161B22] hover:bg-[#1C2128] border border-[#00FF9D]/30 text-[#00FF9D] px-8 py-6 text-lg font-medium rounded-xl transition-all duration-300 shadow-lg shadow-[#00FF9D]/5 backdrop-blur-sm">
                    Go to Chats <ArrowRight className="ml-3 w-5 h-5" />
                  </Button>
                </Link>
                <div className="flex-1">
                  <SubscriptionButton 
                    isPro={isPro} 
                    className="w-full bg-gradient-to-r from-[#00FF9D] to-[#39FF14] hover:opacity-90 text-black px-8 py-6 text-lg font-medium rounded-xl transition-all duration-300 shadow-lg shadow-[#00FF9D]/20"
                  />
                </div>
              </div>
            )}

            {isAuth ? (
              <div className="backdrop-blur-xl bg-[#161B22]/70 p-8 rounded-xl border border-[#00FF9D]/20 shadow-2xl shadow-[#00FF9D]/5 transform hover:scale-102 transition-all duration-300">
                <FileUpload />
              </div>
            ) : (
              <Link href="/sign-in" className="block w-full transform hover:scale-102 transition-all duration-300">
                <Button className="w-full bg-gradient-to-r from-[#00FF9D] to-[#39FF14] hover:opacity-90 text-black font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-300 shadow-lg shadow-[#00FF9D]/20">
                  Login to Get Started <LogIn className="ml-3 w-5 h-5" />
                </Button>
              </Link>
            )}

            {/* Download App Button */}
            {isAuth && (
              <div className="fixed bottom-8 right-8 z-50 group">
                <a
                  href="https://a-talk-with-my-pdf.s3.eu-north-1.amazonaws.com/uploads/app-release.apk"
                  download
                  className="relative flex items-center justify-center p-4 bg-[#161B22]/90 backdrop-blur-lg rounded-2xl shadow-2xl shadow-[#00FF9D]/20 hover:shadow-[#39FF14]/40 transition-all duration-300 transform hover:scale-105 border-2 border-[#00FF9D]/30 hover:border-[#39FF14]/60"
                >
                  {/* Animated border effect */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#00FF9D_0%,#39FF14_50%,#00FF9D_100%)] opacity-20 group-hover:opacity-30 animate-spin-slow"></div>
                  </div>
                  
                  <div className="flex items-center space-x-3 relative z-10">
                    {/* Glowing icon container */}
                    <div className="p-2 rounded-lg bg-[#0D1117] border border-[#00FF9D]/20 group-hover:border-[#39FF14]/40">
                      <FaAndroid className="w-8 h-8 text-[#00FF9D] group-hover:text-[#39FF14] transition-colors" />
                    </div>
                    
                    {/* Text with gradient border */}
                    <span className="text-white font-medium px-4 py-2 rounded-lg bg-[#0D1117]/80 border border-[#00FF9D]/20 group-hover:border-[#39FF14]/40 transition-colors">
                      Get Mobile App
                      {/* Animated underline */}
                      <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#39FF14] group-hover:w-3/4 group-hover:left-1/4 transition-all duration-300"></span>
                    </span>
                  </div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
                    {[...Array(6)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute w-1 h-1 bg-[#00FF9D] rounded-full animate-float"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.5}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </a>
              </div>
            )}

            {!isAuth && (
              <a 
                href="https://a-talk-with-my-pdf.s3.eu-north-1.amazonaws.com/uploads/app-release.apk" 
                download 
                className="block w-full transform hover:scale-[1.02] transition-all duration-300 group"
              >
                <Button className="w-full bg-gradient-to-r from-[#8A2BE2] to-[#4B0082] hover:from-[#9B30FF] hover:to-[#5A009C] border-2 border-[#00FF9D]/30 text-white font-medium px-8 py-6 text-lg rounded-xl transition-all duration-300 shadow-lg shadow-[#8A2BE2]/20 hover:shadow-[#9B30FF]/40">
                  <div className="flex items-center justify-center space-x-3">
                    <FaAndroid className="w-6 h-6 text-[#00FF9D] group-hover:text-[#39FF14] transition-colors" />
                    <span className="bg-gradient-to-r from-[#00FF9D] to-[#39FF14] bg-clip-text text-transparent">
                      Get Android App
                    </span>
                  </div>
                </Button>
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}