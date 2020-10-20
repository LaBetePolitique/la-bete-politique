import React, { useState, useRef, useContext } from "react"

import IconClose from "../../../images/ui-kit/icon-close.svg"
import IconSearch from "../../../images/ui-kit/icon-loupe.svg"
import IconMaleSymbol from "../../../images/ui-kit/icon-male.svg"
import IconFemaleSymbol from "../../../images/ui-kit/icon-female.svg"
import IconReset from "../../../images/ui-kit/icon-refresh.svg"

import AgeSlider from "../slider/Slider"
import Tooltip from "components/tooltip/Tooltip"
import Frame from "components/frames/Frame"
import Button from "components/buttons/Button"
import Input from "components/buttons/Input"
import { DeputiesListContext } from "context/deputies-filters/deputiesFiltersContext"
import {
  calculateAgeDomain,
  calculateNbDepute,
  groupeIconByGroupeSigle,
} from "../deputies-list-utils"

function Filters(props) {
  const {
    state,
    handleSearchValue,
    handleClickOnGroupe,
    handleClickOnSex,
    handleAgeSelection,
    handleReset,
  } = useContext(DeputiesListContext)

  const [isSearchInteracted, setIsSearchInteracted] = useState(false)
  const searchField = useRef(null)

  const allGroupes = state.GroupesList.map((groupe) => {
    return (
      <Input
        className={`groupe groupe--${groupe.Sigle.toLowerCase()}`}
        key={`groupe--${groupe.Sigle}`}
        style={{
          order: groupe.Ordre,
          borderColor: groupe.Couleur,
          backgroundColor: groupe.Couleur,
        }}
        color={groupe.Couleur}
        onClick={() => handleClickOnGroupe(groupe.Sigle)}
        type="checkbox"
        checked={state.GroupeValue[groupe.Sigle]}
      >
        <div className="groupe__img-container">
          <img
            src={groupeIconByGroupeSigle(groupe.Sigle, false)}
            alt={`Icône groupe parlementaire ${groupe.Sigle}`}
          />
          <img
            src={groupeIconByGroupeSigle(groupe.Sigle, true)}
            alt={`Icône groupe parlementaire ${groupe.Sigle} en couleur`}
          />
        </div>
        <Tooltip
          title={groupe.NomComplet}
          nbDeputes={calculateNbDepute(
            state.FilteredList,
            "groupe",
            groupe.Sigle
          )}
          totalDeputes={state.FilteredList.length}
          color={groupe.Couleur}
        />
      </Input>
    )
  })

  return (
    <Frame
      className="frame-filters"
      title="Filtres"
      center={`${state.FilteredList.length} ${
        state.FilteredList.length > 1 ? "Députés" : "Député"
      }`}
      right={`
        ${
          Math.round(
            ((state.FilteredList.length * 100) / state.DeputiesList.length) * 10
          ) / 10
        }%
      `}
    >
      <form
        className={`filters__search ${
          isSearchInteracted ? "filters__search--focus" : ""
        }`}
        onSubmit={(e) => {
          e.preventDefault()
          searchField.current.blur()
        }}
      >
        <div className="search__icon icon-wrapper">
          <IconSearch />
        </div>
        <input
          className="search__input"
          ref={searchField}
          type="text"
          placeholder="Chercher..."
          value={state.Keyword}
          onChange={(e) => {
            handleSearchValue(e.target.value)
          }}
          onFocus={() => setIsSearchInteracted(true)}
          onBlur={() => setIsSearchInteracted(false)}
        />
        <div
          className={`search__clear ${
            state.Keyword.length > 0 ? "search__clear--visible" : ""
          }`}
        >
          <input
            className="search__clear-btn"
            type="reset"
            value=""
            title="Effacer"
            onClick={() => {
              handleSearchValue("")
            }}
          />
          <div className="icon-wrapper">
            <IconClose />
          </div>
        </div>
      </form>
      <div className="filters__middle-line">
        <div className="filters__sexes">
          <Button
            className={`sexes__btn female ${
              state.SexValue["F"] ? "checked" : ""
            }`}
            onClick={() => handleClickOnSex("F")}
            color="main"
            checked={state.SexValue.F}
          >
            <div className="sexe__icon--female-symbol icon-wrapper">
              <IconFemaleSymbol />
            </div>
            <Tooltip
              title="Femmes"
              nbDeputes={calculateNbDepute(state.FilteredList, "sexe", "F")}
              totalDeputes={state.FilteredList.length}
              color="secondary"
            />
          </Button>
          <Button
            className={`sexes__btn male ${
              state.SexValue["H"] ? "checked" : ""
            }`}
            onClick={(e) => handleClickOnSex("H")}
            color="secondary"
            checked={state.SexValue.H}
          >
            <div className="sexe__icon--male-symbol icon-wrapper">
              <IconMaleSymbol />
            </div>
            <Tooltip
              title="Hommes"
              nbDeputes={calculateNbDepute(state.FilteredList, "sexe", "H")}
              totalDeputes={state.FilteredList.length}
              color="secondary"
            />
          </Button>
        </div>
        <div className="filters__groupe">{allGroupes}</div>
        <Button
          className="reset__btn"
          onClick={() => handleReset()}
          title="Réinitialiser les filtres"
        >
          <div className="icon-wrapper">
            <IconReset />
          </div>
        </Button>
      </div>
      <AgeSlider
        selectedDomain={state.AgeDomain}
        domain={calculateAgeDomain(state.DeputiesList)}
        callback={handleAgeSelection}
      >
        <span className="filters__slider-label">ÂGE</span>
      </AgeSlider>
    </Frame>
  )
}

export default Filters
