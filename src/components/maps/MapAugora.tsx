import React, { useState, useContext, useMemo, useEffect } from "react"
import { navigate } from "gatsby"
import InteractiveMap, {
  NavigationControl,
  FullscreenControl,
  Source,
  Layer,
  LayerProps,
  FlyToInterpolator,
  InteractiveMapProps,
} from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import {
  ZoneCode,
  Continent,
  FranceZoneFeature,
  FranceZoneFeatureCollection,
  France,
  franceBox,
  GEOJsonReg,
  DROMGEOJsonReg,
  metroFranceFeature,
  DROMFeature,
  flyToBounds,
  getContinentId,
  getBoundingBoxFromFeature,
  getPolygonCenter,
  getChildFeatures,
  getFeatureZoneCode,
  getMouseEventFeature,
  getZoneFeature,
  getGhostZones,
} from "components/maps/maps-utils"
import CustomControl from "components/maps/CustomControl"
import MapTooltip from "components/maps/MapTooltip"
import MapDeputyPin from "components/maps/MapDeputyPin"
import MapBreadcrumb from "components/maps/MapBreadcrumb"
import MapButton from "components/maps/MapButton"
import IconFrance from "images/logos/projet/augora-logo.svg"
import IconArrow from "images/ui-kit/icon-arrow.svg"
import IconFilter from "images/ui-kit/icon-filter.svg"
import IconClose from "images/ui-kit/icon-close.svg"
import Filters from "components/deputies-list/filters/Filters"
import { DeputiesListContext } from "context/deputies-filters/deputiesFiltersContext"

interface IMapAugora {
  featureToDisplay?: FranceZoneFeature
  setPageTitle?: React.Dispatch<React.SetStateAction<string>>
}

const fillLayerProps: LayerProps = {
  id: "zone-fill",
  type: "fill",
  paint: {
    "fill-color": " #00bbcc",
    "fill-opacity": 0.1,
  },
}

const lineLayerProps: LayerProps = {
  id: "zone-line",
  type: "line",
  paint: {
    "line-color": "#00bbcc",
    "line-width": 2,
  },
}

const hoverLayerProps: LayerProps = {
  id: "zone-fill-hovered",
  type: "fill",
  paint: {
    "fill-color": "#14ccae",
    "fill-opacity": 0.3,
  },
}

const fillGhostLayerProps: LayerProps = {
  id: "zone-ghost-fill",
  type: "fill",
  paint: {
    "fill-color": " #00bbcc",
    "fill-opacity": 0.04,
  },
}

const lineGhostLayerProps: LayerProps = {
  id: "zone-ghost-line",
  type: "line",
  paint: {
    "line-color": "#00bbcc",
    "line-width": 2,
    "line-dasharray": [2, 2],
    "line-opacity": 0.4,
  },
}

/**
 * Renvoie la map augora
 * @param {FranceZoneFeature} [featureToDisplay] La feature à afficher au chargement
 * @param {React.Dispatch<React.SetStateAction<string>>} [setPageTitle] setState function pour changer le titre de la page
 */
export default function MapAugora({
  featureToDisplay = null,
  setPageTitle = undefined,
}: IMapAugora) {
  const { state } = useContext(DeputiesListContext)
  const franceMetroDeputies = useMemo(
    () => state.FilteredList.filter((entry) => entry.NumeroRegion > 10),
    [state.FilteredList]
  )

  const [viewport, setViewport] = useState<InteractiveMapProps>({
    width: "100%",
    height: "100%",
    zoom: 5,
    longitude: France.center.lng,
    latitude: France.center.lat,
  })
  const [currentView, setCurrentView] = useState<{
    GEOJson: FranceZoneFeatureCollection
    zoneCode: ZoneCode
    zoneData: FranceZoneFeature
    zoneDeputies: { [key: string]: any }[] //ça veut juste dire que c'est un array d'objets
  }>({
    GEOJson: GEOJsonReg,
    zoneCode: ZoneCode.Regions,
    zoneData: metroFranceFeature,
    zoneDeputies: franceMetroDeputies,
  })
  const [hoverInfo, setHoverInfo] = useState<{
    filter: [string, ...any[]]
    lngLat: [number, number]
    zoneData: FranceZoneFeature
  }>({
    filter: ["==", ["get", ""], 0],
    lngLat: null,
    zoneData: null,
  })
  const [filterDisplayed, setFilterDisplayed] = useState(false)

  //Update le state des députés de la zone selon la filtered list
  useEffect(() => {
    setCurrentView({
      ...currentView,
      zoneDeputies: getDeputiesInZone(currentView.zoneData),
    })
  }, [state.FilteredList])

  const resetHoverInfo = () => {
    if (hoverInfo.filter !== ["==", ["get", ""], 0])
      setHoverInfo({
        filter: ["==", ["get", ""], 0],
        lngLat: null,
        zoneData: null,
      })
  }

  const changePageTitle = (zoneName: string) => {
    if (setPageTitle) setPageTitle(zoneName)
  }

  /**
   * Affiche l'outre-mer
   */
  const displayDROM = () => {
    setCurrentView({
      GEOJson: DROMGEOJsonReg,
      zoneCode: ZoneCode.Regions,
      zoneData: DROMFeature,
      zoneDeputies: getDeputiesInZone(DROMFeature),
    })

    setViewport({
      ...viewport,
      zoom: 3,
      longitude: 0,
      latitude: 0,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: "auto",
    })

    changePageTitle(DROMFeature.properties.nom)

    resetHoverInfo()
  }

  /**
   * Affiche une nouvelle vue
   * @param {FranceZoneFeature} feature La feature de la zone à afficher
   */
  const displayNewZone = (feature: FranceZoneFeature): void => {
    const zoneCode = getFeatureZoneCode(feature)

    switch (zoneCode) {
      case ZoneCode.Regions:
      case ZoneCode.Departements:
        const childrenZonesCode =
          zoneCode === ZoneCode.Regions &&
          getContinentId(feature) === Continent.France
            ? ZoneCode.Departements
            : ZoneCode.Circonscriptions

        const newZoneGEOJson = getChildFeatures(feature)

        const newDeputiesInZone = getDeputiesInZone(feature)

        setCurrentView({
          GEOJson: newZoneGEOJson,
          zoneCode: childrenZonesCode,
          zoneData: feature,
          zoneDeputies: newDeputiesInZone,
        })

        changePageTitle(feature.properties.nom)

        flyToBounds(getBoundingBoxFromFeature(feature), viewport, setViewport)

        resetHoverInfo()
        return
      case ZoneCode.Continent:
        feature.properties[zoneCode] === Continent.DROM
          ? displayDROM()
          : handleReset()
        return
      default:
        return
    }
  }

  /**
   * Renvoie un array contenant tous les députés de la zone et leurs infos
   * @param {FranceZoneFeature} feature La feature de la zone à fouiller
   */
  const getDeputiesInZone = (
    feature: FranceZoneFeature
  ): { [key: string]: any }[] => {
    const zoneCode = getFeatureZoneCode(feature)
    const continentId = getContinentId(feature)

    switch (zoneCode) {
      case ZoneCode.Continent:
        if (feature.properties[zoneCode] === 1)
          return state.FilteredList.filter((i) => {
            return i.NumeroRegion < 10
          })
        else
          return state.FilteredList.filter((i) => {
            return i.NumeroRegion > 10
          })
      case ZoneCode.Regions:
        return state.FilteredList.filter((i) => {
          return continentId !== Continent.COM
            ? i.NumeroRegion == feature.properties[ZoneCode.Regions]
            : i.NumeroDepartement == feature.properties[ZoneCode.Regions]
        })
      case ZoneCode.Departements:
        return state.FilteredList.filter((i) => {
          return (
            i.NumeroDepartement == feature.properties[ZoneCode.Departements]
          )
        })
      case ZoneCode.Circonscriptions:
        return [
          state.FilteredList.find((i) => {
            return continentId === Continent.DROM
              ? i.NumeroCirconscription ==
                  feature.properties[ZoneCode.Circonscriptions] &&
                  i.NumeroRegion == feature.properties[ZoneCode.Regions]
              : i.NumeroCirconscription ==
                  feature.properties[ZoneCode.Circonscriptions] &&
                  i.NumeroDepartement ==
                    feature.properties[ZoneCode.Departements]
          }),
        ]
      default:
        return []
    }
  }

  const handleHover = (e) => {
    const feature = getMouseEventFeature(e)
    if (feature && viewport.zoom < 13) {
      const zoneCode = getFeatureZoneCode(feature)
      setHoverInfo({
        filter: ["==", ["get", zoneCode], feature.properties[zoneCode]],
        lngLat: e.lngLat,
        zoneData: feature,
      })
    } else resetHoverInfo()
  }

  const handleClick = (e) => {
    if (e.leftButton) {
      const feature = getMouseEventFeature(e)
      if (feature) {
        const zoneCode = getFeatureZoneCode(feature)
        if (zoneCode === ZoneCode.Circonscriptions) {
          const deputy = getDeputiesInZone(feature)[0]
          if (deputy) navigate(`/depute/${deputy.Slug}`)
        } else {
          displayNewZone(feature)
        }
      }
      resetHoverInfo()
    } else if (e.rightButton) handleBack()
  }

  const handleBack = () => {
    if (currentView.zoneCode === ZoneCode.Circonscriptions) {
      const contId = getContinentId(currentView.zoneData)
      if (contId === Continent.France) {
        const regionFeature = getZoneFeature(
          currentView.GEOJson.features[0].properties[ZoneCode.Regions],
          ZoneCode.Regions
        )

        displayNewZone(regionFeature)
      } else displayDROM()
    } else if (currentView.zoneCode === ZoneCode.Departements) {
      handleReset()
    }
  }

  /**
   * Affiche la france métropolitaine
   */
  const handleReset = () => {
    setCurrentView({
      GEOJson: GEOJsonReg,
      zoneCode: ZoneCode.Regions,
      zoneData: metroFranceFeature,
      zoneDeputies: franceMetroDeputies,
    })

    changePageTitle(metroFranceFeature.properties.nom)

    flyToBounds(franceBox, viewport, setViewport)

    resetHoverInfo()
  }

  /**
   * Appelé au chargement, permet de target l'object mapbox pour utiliser ses méthodes
   * @param event L'event contient une ref de la map
   */
  const handleLoad = (event) => {
    const map = event.target
    // console.log(map.getStyle().layers)

    //Enlève les frontières
    map.removeLayer("admin-0-boundary") //Les frontières des pays
    map.removeLayer("admin-0-boundary-bg")
    map.removeLayer("admin-1-boundary") //Les frontières des régions
    map.removeLayer("admin-1-boundary-bg")
    map.removeLayer("admin-0-boundary-disputed") //Les frontières contestées

    // console.log(location.state)

    if (featureToDisplay) {
      switch (getContinentId(featureToDisplay)) {
        case Continent.DROM:
          const reg = getZoneFeature(
            featureToDisplay.properties[ZoneCode.Regions],
            ZoneCode.Regions
          )
          displayNewZone(reg)
          return
        case Continent.COM:
          displayNewZone(
            getZoneFeature(
              featureToDisplay.properties[ZoneCode.Departements],
              ZoneCode.Regions
            )
          )
        case Continent.France:
          const dpt = getZoneFeature(
            featureToDisplay.properties[ZoneCode.Departements],
            ZoneCode.Departements
          )
          displayNewZone(dpt)
          return
        default:
          return
      }
    } else flyToBounds(franceBox, viewport, setViewport)
  }

  /**
   * Renvoie le JSX des pins députés
   */
  const createPins = (): JSX.Element[] => {
    if (currentView.zoneCode === ZoneCode.Circonscriptions) {
      const contId = getContinentId(currentView.zoneData)
      if (
        (contId === Continent.France && viewport.zoom > 7) ||
        (contId !== Continent.France && viewport.zoom > 5)
      ) {
        return currentView.GEOJson.features.map((feature, index) => {
          const centerCoords = getPolygonCenter(feature)
          return (
            <MapDeputyPin
              key={`${feature.properties.nom_dpt} ${index}`}
              lng={centerCoords[0]}
              lat={centerCoords[1]}
              deputy={currentView.zoneDeputies.find((entry) => {
                return (
                  entry.NumeroCirconscription == feature.properties.num_circ
                )
              })}
            />
          )
        })
      }
    }
  }

  return (
    <InteractiveMap
      mapboxApiAccessToken="pk.eyJ1Ijoia29iYXJ1IiwiYSI6ImNrMXBhdnV6YjBwcWkzbnJ5NDd5NXpja2sifQ.vvykENe0q1tLZ7G476OC2A"
      mapStyle="mapbox://styles/mapbox/light-v10?optimize=true"
      {...viewport}
      width="100%"
      height="100%"
      minZoom={2}
      dragRotate={false}
      doubleClickZoom={false}
      touchRotate={false}
      interactiveLayerIds={["zone-fill", "zone-ghost-fill"]}
      onLoad={handleLoad}
      onViewportChange={(change) => setViewport(change)}
      onHover={handleHover}
      onClick={handleClick}
    >
      <Source type="geojson" data={currentView.GEOJson}>
        <Layer {...hoverLayerProps} filter={hoverInfo.filter} />
        <Layer {...fillLayerProps} />
        <Layer {...lineLayerProps} />
      </Source>
      <Source type="geojson" data={getGhostZones(currentView.zoneData)}>
        <Layer
          {...hoverLayerProps}
          id="zone-ghost-fill-hovered"
          filter={hoverInfo.filter}
        />
        <Layer {...lineGhostLayerProps} />
        <Layer {...fillGhostLayerProps} />
      </Source>
      {hoverInfo.zoneData && viewport.zoom < 13 ? (
        <MapTooltip
          lngLat={hoverInfo.lngLat}
          zoneFeature={hoverInfo.zoneData}
          deputiesArray={getDeputiesInZone(hoverInfo.zoneData)}
          totalDeputes={state.FilteredList.length}
        />
      ) : null}
      {createPins()}
      <div className="map__navigation map__navigation-right">
        <NavigationControl
          showCompass={false}
          zoomInLabel="Zoomer"
          zoomOutLabel="Dézoomer"
        />
        <FullscreenControl />
        <MapButton
          className="visible"
          title="Revenir sur la France métropolitaine"
          onClick={handleReset}
        >
          <IconFrance />
        </MapButton>
      </div>
      <div className="map__navigation map__navigation-left">
        <MapBreadcrumb
          feature={currentView.zoneData}
          handleClick={displayNewZone}
        />
        <MapButton
          className={currentView.zoneCode === ZoneCode.Regions ? "" : "visible"}
          title="Revenir à la vue précédente"
          onClick={handleBack}
        >
          <IconArrow
            style={{
              transform: "rotate(90deg)",
            }}
          />
        </MapButton>
      </div>
      <div
        className={`map__navigation map__navigation-bottom ${
          filterDisplayed ? "" : "visible"
        }`}
      >
        <MapButton
          className="visible"
          title="Afficher les filtres"
          onClick={() => setFilterDisplayed(true)}
        >
          <IconFilter />
        </MapButton>
      </div>
      <div className={`map__filters ${filterDisplayed ? "visible" : ""}`}>
        <CustomControl>
          <Filters />
          <button
            className="map__filters-close"
            onClick={() => setFilterDisplayed(false)}
            title="Cacher les filtres"
          >
            <div className="icon-wrapper">
              <IconClose />
            </div>
          </button>
        </CustomControl>
      </div>
    </InteractiveMap>
  )
}
