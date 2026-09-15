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
    margin: (x: 80pt, y: 100pt),
    fill: rgb("#fdfbf7"),
  )
  set text(
    font: font-family,
    size: 24pt,
    fill: rgb("#333333"),
  )
  set par(
    justify: true,
    leading: 1.8em,
    first-line-indent: 2em,
  )

  // Top border (only if title or author is set, or as a subtle book ornament)
  line(length: 100%, stroke: 0.5pt + rgb("#d4cbb3"))
  v(20pt)

  // Title (optional)
  if title != "" {
    align(center)[
      #text(size: 42pt, weight: "bold", title)
    ]
    v(36pt)
  }

  // Body
  body

  // Footer (optional, only if author or source is provided)
  if author != "" or source != "" {
    align(bottom)[
      #v(1fr)
      #line(length: 100%, stroke: 0.5pt + rgb("#d4cbb3"))
      #v(20pt)
      #grid(
        columns: (1fr, auto),
        align(left + horizon)[
          #if source != "" [
            #text(size: 18pt, fill: rgb("#777777"))[摘自《#source》]
          ]
        ],
        align(right + horizon)[
          #if author != "" [
            #text(size: 20pt, fill: rgb("#555555"))[— #author]
            #h(10pt)
            #box(
              stroke: 1.5pt + rgb("#c43227"),
              radius: 2pt,
              inset: 4pt,
              fill: rgb("#c43227").transparentize(90%)
            )[
              #text(fill: rgb("#c43227"), weight: "bold", author.last())
            ]
          ]
        ]
      )
    ]
  }
}
