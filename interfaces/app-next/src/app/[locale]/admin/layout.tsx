import { AdvisorLayoutClient } from "./layout-client";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdvisorLayout({ children, params }: Props) {
  return <AdvisorLayoutClient >{children}</AdvisorLayoutClient>;
}