import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SliderProvider } from "@/contexts/SliderContext";
import { OurSuccessProvider } from "@/contexts/OurSuccessContext";
import { OurInstitutionsProvider } from "@/contexts/OurInstitutionsContext";
import { OurRecruitersProvider } from "@/contexts/OurRecruitersContext";
import { WhyChooseUsProvider } from "@/contexts/WhyChooseUsContext";
import { TestimonialProvider } from "@/contexts/TestimonialContext";
import { OutstandingPlacementsProvider } from "@/contexts/OutstandingPlacementsContext";
import { PlacementProvider } from "@/contexts/PlacementContext";
import { AboutGroupProvider } from "@/contexts/AboutGroupContext";
import { PhilosophyProvider } from "@/contexts/PhilosophyContext";
import { DirectorDeskProvider } from "@/contexts/DirectorDeskContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TIPER (Translam Institute of Pharmaceutical Education & Research)",
  description: "TIPER is a premier pharmacy institute offering quality education, advanced labs, research-focused learning, and strong placement opportunities in the pharma industry.",
  icons: {
    icon: '/favicon.png', // or '/images/your-favicon.png'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
        {/* <link rel="shortcut icon" href="/images/logo.svg" /> */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SliderProvider>
          <OurSuccessProvider>
            <OurInstitutionsProvider>
              <OurRecruitersProvider>
                <WhyChooseUsProvider>
                  <TestimonialProvider>
                    <OutstandingPlacementsProvider>
                      <PlacementProvider>
                        <AboutGroupProvider>
                          <PhilosophyProvider>
                            <DirectorDeskProvider>
                              {children}
                            </DirectorDeskProvider>
                          </PhilosophyProvider>
                        </AboutGroupProvider>
                      </PlacementProvider>
                    </OutstandingPlacementsProvider>
                  </TestimonialProvider>
                </WhyChooseUsProvider>
              </OurRecruitersProvider>
            </OurInstitutionsProvider>
          </OurSuccessProvider>
        </SliderProvider>
      </body>
    </html>
  );
}

