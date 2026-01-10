import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const Test = () => {
    // const router = useRouter()
    const tAuth = useTranslations('auth');
    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Button size="lg" className="text-lg" asChild onClick={() => router.push("/register")}> */}
            <Link href="/register">
                {tAuth('buttons.openAccount')}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            {/* </Button> */}
            {/* <Button size="lg" variant="outline" className="text-lg" asChild onClick={() => router.push("/login")}> */}
            <Link href="/login">
                {tAuth('buttons.login')}
            </Link>
            {/* </Button> */}
        </div>
    )
}