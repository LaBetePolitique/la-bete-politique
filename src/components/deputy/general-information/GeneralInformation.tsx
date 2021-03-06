import React, { useState, useEffect } from "react"
import dayjs from "dayjs"
import "dayjs/locale/fr"
dayjs.locale("fr")

import IconMale from "images/ui-kit/icon-persontie.svg"
import IconFemale from "images/ui-kit/icon-personw.svg"

import Block from "../_block/_Block"
import DeputyImage from "./deputy-image/DeputyImage"

const getDates = (date: string) => {
  const formatedDate = dayjs(date)
  const dateDay = formatedDate.format("DD")
  const dateMonth = formatedDate.format("MMMM")
  const dateYear = formatedDate.format("YYYY")

  return {
    day: dateDay,
    month: dateMonth,
    year: dateYear,
  }
}

/**
 * Return deputy's general information in a Block component
 * @param {*} props
 */
export default function GeneralInformation(props: Bloc.General) {
  const [Date, setDate] = useState({
    day: "01",
    month: "janvier",
    year: "2020",
  })

  useEffect(() => {
    setDate(getDates(props.dateBegin))
  }, [props.dateBegin])

  return (
    <Block
      className="deputy__block deputy__general"
      title="Informations Générales"
      type="general"
      color={props.color}
      size={props.size}
      wip={props.wip ? props.wip : false}
    >
      <div className="icon-wrapper">{props.sexe === "F" ? <IconFemale /> : <IconMale />}</div>
      <div className={`block__main general__main`}>
        <div className="main__picture">
          <div
            className="main__picture-container"
            style={{
              borderColor: props.color,
            }}
          >
            <DeputyImage src={props.picture} alt={props.id} sex={props.sexe} />
          </div>
        </div>
        <div className="main__info">
          <div className="icon-wrapper" title={props.groupeComplet}>
            <props.pictureGroup />
          </div>
          <div className="main__age">
            <div className="main__age-date">
              {props.age}
              <div>ans</div>
            </div>
            <div className="main__birthday">
              <h3>{props.sexe === "F" ? `Née le` : `Né le`}</h3>
              <p className="birthday__day-month">
                <strong>{Date.day}</strong> {Date.month}
              </p>
              <p className="birthday__year">
                <strong>{Date.year}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="general__job">
        <div className="job">{props.job ? props.job : "Sans profession"}</div>
      </div>
    </Block>
  )
}
