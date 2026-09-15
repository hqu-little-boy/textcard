#let card(
  width: 1080pt,
  height: 1440pt,
  title: "",
  author: "",
  source: "",
  font-family: "Serif",
  body
) = {
  set page(
    width: width,
    height: height,
    margin: (x: 60pt, y: 70pt),
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

  // Header line (if title or author/source is provided)
  if title != "" or author != "" or source != "" {
    line(length: 100%, stroke: 3pt + black)
    v(2pt)
    line(length: 100%, stroke: 1pt + black)
    v(18pt)
  }

  // Title (optional)
  if title != "" {
    align(center)[
      #text(size: 54pt, weight: "bold", title)
    ]
    v(18pt)
  }

  // Author and source byline (optional)
  if author != "" or source != "" {
    grid(
      columns: (1fr, auto),
      text(style: "italic")[
        #if author != "" [By #author]
        #if author != "" and source != "" [ · ]
        #if source != "" [From #source]
      ],
      text(style: "italic")[Special Edition]
    )
    v(10pt)
    line(length: 100%, stroke: 1pt + black)
    v(25pt)
  } else if title != "" {
    line(length: 100%, stroke: 1pt + black)
    v(25pt)
  }

  // Body
  columns(2, gutter: 30pt)[
    #body
  ]
}
