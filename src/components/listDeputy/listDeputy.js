import React, { Component } from "react"
import { getDeputiesInOffice } from "lbp-wrapper"
import OneDeputy from "./oneDeputy"
import "./listDeputy.css"
import "../home/home.css"

class ListDeputy extends Component {
  constructor(...props) {
    super(...props)
    this.state = {
      loaded: false,
      deputes: null,
    }
  }
  componentDidMount() {
    getDeputiesInOffice()
    .then(
      depute => this.setState(function (state) {
        return {
          loaded: true,
          deputes: depute,
        }
      })
    )
    .catch(err => console.error("Error:", err))
  }
  render() {
    if (!this.state.loaded) { // Pendant que je charge
      return null
    } else { // Si mes députés ont chargé
      console.log(this.state.deputes) // Récupéré mon objet dans la console
      var that = this // Redéfinir le this pour le récupérer à l'intérieur du map
      const listDeputies = this.state.deputes.result.map(function (deputeID) {
        // return <OneDeputy
        //   key={deputeID}
        //   data={that.state.deputes.entities.depute[deputeID]}
        // />
        return <a
          href={that.state.deputes.entities.depute[deputeID].url_an}
          id={"depute-" + deputeID} key={deputeID}
          className="depute"
          target="_blank">
            {that.state.deputes.entities.depute[deputeID].nom}
          </a>
      })
      return (
        listDeputies
      )
    }
  }
}

export default ListDeputy;
