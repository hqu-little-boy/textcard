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

  // Top border
  line(length: 100%, stroke: 0.5pt + rgb("#d4cbb3"))
  v(20pt)

  // Title
  if title != "" {
    align(center)[
      #text(size: 42pt, weight: "bold", title)
    ]
    v(40pt)
  }

  // Body
  body

  // Footer
  align(bottom)[
    #v(1fr)
    #line(length: 100%, stroke: 0.5pt + rgb("#d4cbb3"))
    #v(20pt)
    #grid(
      columns: (1fr, auto),
      [],
      align(right)[
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
