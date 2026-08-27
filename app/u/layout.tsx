import { pageFontVariables } from "@/components/profile/page-font-loader";

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={pageFontVariables()}>{children}</div>;
}
