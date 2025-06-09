
interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <>
      <main className="mx-auto flex-1 overflow-hidden">{children}</main>
    </>
  );
}
