import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export const ButtonLoading = ({ loading, children, ...props }: React.ComponentProps<'button'> & { loading: boolean }) =>
    <Button disabled={loading} {...props}>
        {loading && (
            <Spinner />
        )}
        {children}
    </Button>