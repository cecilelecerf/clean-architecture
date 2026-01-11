import { DirectorLayoutClient } from './layout-client';

type Props = {
  children: React.ReactNode;
};

export default async function DirectorLayout({ children }: Props) {
  return <DirectorLayoutClient >{children}</DirectorLayoutClient>;
}