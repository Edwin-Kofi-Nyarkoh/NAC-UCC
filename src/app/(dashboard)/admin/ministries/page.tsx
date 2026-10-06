"use client"

import { CollectionManager } from "@/components/dashboard/collection-manager"
import { api } from "@/lib/api"
import type { Ministry } from "@/types"

export default function AdminMinistriesPage() {
  return (
    <CollectionManager<Ministry>
      title="Ministries"
      description="Each ministry gets a card on the Ministries page and a page of its own."
      noun="ministry"
      resource={api.ministries}
      media={{ label: "Photo", hint: "Optional. Shown at the top of the ministry page." }}
      mediaOf={(ministry) =>
        ministry.imagePublicId ? { publicId: ministry.imagePublicId, type: "image", width: 0, height: 0 } : null
      }
      fields={[
        { name: "name", label: "Name", placeholder: "e.g. Music Ministry" },
        {
          name: "description",
          label: "Description",
          kind: "textarea",
          hint: "What the ministry does and who it is for. Line breaks are kept.",
        },
        { name: "leader", label: "Leader", hint: "Optional" },
        { name: "meetingDay", label: "Meeting day", placeholder: "e.g. Saturday", hint: "Optional" },
        { name: "meetingTime", label: "Meeting time", placeholder: "e.g. 4:00 PM", hint: "Optional" },
      ]}
      toInput={(values, media) => ({
        name: values.name,
        description: values.description,
        leader: values.leader,
        meetingDay: values.meetingDay,
        meetingTime: values.meetingTime,
        imagePublicId: media?.publicId ?? "",
      })}
      summarise={(ministry) => ({
        title: ministry.name,
        subtitle: [ministry.leader, ministry.meetingDay, ministry.meetingTime].filter(Boolean).join(" · "),
      })}
    />
  )
}
