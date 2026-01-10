import { DirectorLayoutClient } from './layout-client';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DirectorLayout({ children, params }: Props) {
  return <DirectorLayoutClient >{children}</DirectorLayoutClient>;
}