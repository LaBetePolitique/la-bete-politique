import React from "react"
import CustomControl from "components/maps/CustomControl"

/**
 * Renvoie un input formatté pour la map, on peut lui passer une icone en child
 */
export default function MapInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { children, ...other } = props

  return (
    <CustomControl>
      <div className="input__container">
        <input {...other} className={`navigation__input ${other.className ? other.className : ""}`} />
        <div className="icon-wrapper">{props.children}</div>
      </div>
    </CustomControl>
  )
}
