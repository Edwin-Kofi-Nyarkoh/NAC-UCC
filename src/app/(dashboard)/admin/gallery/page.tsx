"use client"

import { CollectionManager } from "@/components/dashboard/collection-manager"
import { api } from "@/lib/api"
import type { GalleryItem } from "@/types"

export default function AdminGalleryPage() {
  return (
    <CollectionManager<GalleryItem>
      title="Gallery"
      description="Photos and videos on the Gallery page. The newest are shown first."
      noun="photo"
      resource={api.gallery}
      media={{ label: "Photo or video", allowVideo: true, required: true }}
      mediaOf={(item) => ({ publicId: item.publicId, type: item.type, width: item.width, height: item.height })}
      fields={[
        { name: "caption", label: "Caption", placeholder: "e.g. Harvest Thanksgiving", hint: "Optional" },
        {
          name: "category",
          label: "Category",
          placeholder: "e.g. Services, Outreach, Youth",
          hint: "Optional. Visitors can filter the gallery by category.",
        },
      ]}
      toInput={(values, media) => ({
        caption: values.caption,
        category: values.category,
        publicId: media?.publicId,
        type: media?.type,
        width: media?.width,
        height: media?.height,
      })}
      summarise={(item) => ({ title: item.caption || "Untitled", subtitle: item.category })}
    />
  )
}
