import React, { useState } from "react"
import dynamic from "next/dynamic"
const GradientBanner = dynamic(() => import("../graphics/GradientBanner"), {
  ssr: false,
})

export default function PageTitle(props: { title: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <>
      <div
        className={`page-title ${hovered ? "page-title--hovered" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <h1 className="page-title__title">{props.title}</h1>
        <GradientBanner />
      </div>
    </>
  )
}
