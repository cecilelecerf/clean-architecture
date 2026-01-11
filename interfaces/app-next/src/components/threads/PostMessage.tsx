"use client"
import { ButtonLoading } from "@/components/buttons/ButtonLoading";
import { Input } from "@/components/ui/input";
import { socket } from "@/lib/socket";
import { endpoints } from "@/utils/endpoint";
import { ThreadId } from "@infrastructure/types/thread";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export const PostMessage = ({ threadId }: { threadId: ThreadId }) => {
    const [input, setInput] = useState("");
    const sendMessageMutate = useMutation(endpoints.threads.messages.send({ threadId }))
    const handlePress = () => {
        if (!input.length) return
        sendMessageMutate.mutate({ content: input }, {
            onSuccess: (data) => {
                socket.emit("thread:new_message", { message: data });
                setInput("")
            }
        })
    }
    const t = useTranslations("thread");
    return (
        <div className="flex gap-3 mt-4">
            <Input
                type="text"
                value={input}
                placeholder={t("placeholder")}
                onChange={(e) => setInput(e.target.value)}
                data-form-type="other"
            />
            <ButtonLoading loading={sendMessageMutate.isPending} onClick={handlePress}>
                <ArrowRight />
            </ButtonLoading>
        </div>
    )
}