import { ButtonLoading } from "@/components/ButtonLoading";
import { Input } from "@/components/ui/input";
import { socket } from "@/lib/socket";
import { advisorEndpoint } from "@/utils/endpoint/advisor";
import { ThreadId } from "@infrastructure/types/thread";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export const PostMessage = ({ threadId }: { threadId: ThreadId }) => {
    const [input, setInput] = useState("");
    const sendMessageMutate = useMutation(advisorEndpoint.thread.messages.post({ threadId }))
    const handlePress = () => {
        input.length && sendMessageMutate.mutate(input, {
            onSuccess: (data) => {
                socket.emit("thread:new_message", { message: data });
                setInput("")
            }
        })
    }
    return (
        <div className="flex gap-3 mt-4">
            <Input
                type="text"
                value={input}
                placeholder="Écrire un message..."
                onChange={(e) => setInput(e.target.value)}
                data-form-type="other"
            />
            <ButtonLoading loading={sendMessageMutate.isPending} onClick={handlePress}   >  <ArrowRight /></ButtonLoading>
        </div>
    )
}