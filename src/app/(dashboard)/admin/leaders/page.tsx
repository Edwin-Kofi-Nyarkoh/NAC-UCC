"use client"

import { CollectionManager } from "@/components/dashboard/collection-manager"
import { api } from "@/lib/api"
import type { Leader } from "@/types"

export default function AdminLeadersPage() {
  return (
    <CollectionManager<Leader>
      title="Leaders"
      description="The leadership team shown on the About page, in this order."
      noun="leader"
      resource={api.leaders}
      media={{ label: "Photo", hint: "Optional. Without a photo the leader is shown by their initials." }}
      mediaOf={(leader) =>
        leader.imagePublicId ? { publicId: leader.imagePublicId, type: "image", width: 0, height: 0 } : null
      }
      fields={[
        { name: "name", label: "Name", placeholder: "Full name" },
        { name: "title", label: "Role", placeholder: "e.g. Rector, Youth Leader" },
        { name: "bio", label: "Short bio", kind: "textarea", hint: "Optional. One or two sentences." },
      ]}
      toInput={(values, media) => ({
        name: values.name,
        title: values.title,
        bio: values.bio,
        imagePublicId: media?.publicId ?? "",
      })}
      summarise={(leader) => ({ title: leader.name, subtitle: leader.title })}
    />
  )
}
