import React, { useState } from "react"

// Icons
import IconArrow from "images/ui-kit/icon-arrow.svg"

// Graphics
import dynamic from "next/dynamic"
const GradientBanner = dynamic(() => import("../graphics/GradientBanner"), {
  ssr: false,
})

function Question(props) {
  const [Open, setOpen] = useState(false)
  return (
    <div className={`faq__question ${Open ? "faq__question--opened" : ""}`}>
      <div
        className="faq__title-container"
        onClick={() => setOpen(!Open)}
        role="button"
        tabIndex={0}
        onKeyDown={() => setOpen(!Open)}
      >
        <GradientBanner />
        <h2>{props.title}</h2>
        <div className="arrow__icon icon-wrapper">
          <IconArrow />
        </div>
      </div>
      <div className="faq__description">{props.children}</div>
    </div>
  )
}

export default Question
