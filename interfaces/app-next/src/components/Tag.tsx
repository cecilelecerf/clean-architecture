import { TagToFront, Tag as TagType } from "@infrastructure/types/feed"
import { Badge } from "./ui/badge"
import { bgColorClasses, textColorClasses } from "@/utils/color"

export const Tag = ({ tag }: { tag: TagToFront }) =>
    <Badge className={`${bgColorClasses[300][tag.color]} ${textColorClasses[950][tag.color]} h-fit`} >{tag.label}</Badge>

