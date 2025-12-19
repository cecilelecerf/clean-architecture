import { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "../ui/button";
import { Spinner } from "../ui/spinner";

export const ButtonLoading = ({ loading, children, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { loading: boolean }) =>
    <Button disabled={loading} {...props}>
        {loading && (
            <Spinner />
        )}
        {children}
    </Button>