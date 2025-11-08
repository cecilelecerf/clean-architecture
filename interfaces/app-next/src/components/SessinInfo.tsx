"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function SessionInfo() {
  const { data: session } = useSession();
  if (!session) return (<p>Non connecté</p>);

  return <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
    <div>
      <p className="text-sm text-muted-foreground">Bonjour 👋</p>
      <p className="font-semibold text-lg">{session.user.name}</p>
    </div>
  </div>;
}
