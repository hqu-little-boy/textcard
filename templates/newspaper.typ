#let card(
  width: 1080pt,
  height: 1440pt,
  title: "",
  author: "",
  font-family: "Serif",
  body
) = {
  set page(
    width: width,
    height: height,
    margin: (x: 60pt, y: 80pt),
    fill: rgb("#f5f0e1"),
  )
  set text(
    font: font-family,
    size: 20pt,
    fill: rgb("#222222"),
  )
  set par(
    justify: true,
    leading: 1.4em,
  )

  // Header line
  line(length: 100%, stroke: 3pt + black)
  v(2pt)
  line(length: 100%, stroke: 1pt + black)
  v(20pt)

  // Title
  if title != "" {
    align(center)[
      #text(size: 60pt, weight: "bold", title)
    ]
    v(20pt)
  }

  // Author and date line
  grid(
    columns: (1fr, auto),
    text(style: "italic")[By #author],
    text(style: "italic")[Vol. 1, No. 1]
  )
  v(10pt)
  line(length: 100%, stroke: 1pt + black)
  v(30pt)

  // Body
  columns(2, gutter: 30pt)[
    #body
  ]
}
