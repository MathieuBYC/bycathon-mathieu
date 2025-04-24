import "./globals.css";
import { Quicksand, DM_Sans } from "next/font/google";
import { BubbleBackground } from "@/components/animate-ui/bubble-background";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${dmSans.variable}`}>
      <body>
        <div className="w-full overflow-hidden">
          <BubbleBackground
            interactive
            className="absolute inset-0 flex items-center justify-center z-[-1] brightness-70"
            colors={{
              first: "18,113,255",
              second: "221,74,255",
              third: "0,220,255",
              fourth: "200,50,50",
              fifth: "180,180,50",
              sixth: "140,100,255",
            }}
          />
          <main className="p-x[30px] font-body h-full w-screen overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
