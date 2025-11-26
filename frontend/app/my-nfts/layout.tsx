import Header from "@/components/header";

export default function MyNFTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {" "}
      <Header />
      {children}
    </>
  );
}
