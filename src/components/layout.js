import React from "react"
import Head from "next/head"
import { colors } from "utils/variables"

import Header from "./header"
import Footer from "./footer"
import PageTitle from "../components/titles/PageTitle"

import Popin from "./popin/popin"

const allColors = colors.map((color) => {
  return "--" + color.name + "-color :" + color.hex + ";\n"
})

// const headerHeight =

const Layout = ({ children, location, title }) => {
  // Check if page has SEO informations

  return (
    <div className={`${title ? "with-title" : "no-title"}`}>
      <Head>
        <style>{`:root {\n${allColors.join("")}}`}</style>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Header siteTitle={"Augora"} location={location} />
      {title ? <PageTitle title={title} /> : null}
      {/* <PageTitle title={location.title} /> */}
      {/* <Popin>Je suis une popin</Popin> */}
      <main className="layout">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
