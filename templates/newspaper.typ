#let card(
  width: 1080pt,
  height: 1440pt,
  title: "",
  author: "",
  source: "",
  font-family: "Serif",
  font-size: 20pt,
  line-height: 0.65em,
  par-spacing: 1.6em,
  bg-color: none,
  first-line-indent: 2em,
  justify: true,
  body
) = {
  let default-bg = rgb("#f5f0e1")
  let page-bg = if bg-color != none { bg-color } else { default-bg }
  set page(
    width: width,
    height: height,
    margin: (x: 60pt, y: 70pt),
    fill: page-bg,
  )
  set text(
    font: (font-family, "DejaVu Serif", "DejaVu Sans", "Droid Sans Fallback"),
    size: font-size,
    fill: rgb("#222222"),
  )
  set par(
    justify: justify,
    leading: line-height,
    spacing: par-spacing,
    first-line-indent: first-line-indent,
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
      #text(size: font-size * 2.2, weight: "bold", title)
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
  if height == auto {
    body
  } else {
    columns(2, gutter: 30pt)[
      #body
    ]
  }
}

