import { Wrapper } from "./client-components/Wrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const ProfileComponent = async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return <div>Unauthorized</div>;
    return <Wrapper userId={session.user.id} />
} 