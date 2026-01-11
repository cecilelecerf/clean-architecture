import Link from "next/link"
import { Button, buttonVariants } from "./ui/button"
import { VariantProps } from "class-variance-authority"
import { ReactNode } from "react"
type Props = {
    children: ReactNode,
    href: string,
} & React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants>
export const ButtonLink = ({ children, href, ...button }: Props) => (
    <Button asChild {...button}>
        <Link href={href}>{children}</Link>
    </Button>
)