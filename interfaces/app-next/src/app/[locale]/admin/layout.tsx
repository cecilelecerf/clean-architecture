import { AdvisorLayoutClient } from "./layout-client";

type Props = {
  children: React.ReactNode;
};

export default async function AdvisorLayout({ children }: Props) {
  return <AdvisorLayoutClient >{children}</AdvisorLayoutClient>;
}