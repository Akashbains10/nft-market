import Footer from "@/components/footer";
import Header from "@/components/header";
import React from "react";

export default function NFTDetailLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
