#let card(
  width: 1080pt,
  height: 1440pt,
  title: "",
  author: "",
  source: "",
  font-family: "Serif",
  font-size: 24pt,
  line-height: 0.75em,
  par-spacing: 1.8em,
  bg-color: none,
  first-line-indent: 2em,
  justify: true,
  body
) = {
  let default-bg = rgb("#fdfbf7")
  let page-bg = if bg-color != none { bg-color } else { default-bg }
  set page(
    width: width,
    height: height,
    margin: (x: 80pt, y: 80pt),
    fill: page-bg,
  )
  set text(
    font: (font-family, "Droid Sans Fallback"),
    size: font-size,
    fill: rgb("#333333"),
  )
  set par(
    justify: justify,
    leading: line-height,
    spacing: par-spacing,
    first-line-indent: first-line-indent,
  )

  // Top border
  line(length: 100%, stroke: 0.5pt + rgb("#d4cbb3"))
  v(20pt)

  // Title (optional)
  if title != "" {
    align(center)[
      #text(size: font-size * 1.75, weight: "bold", title)
    ]
    v(36pt)
  }

  // Body
  body

  // Footer (optional, only if author or source is provided)
  if author != "" or source != "" {
    if height == auto {
      v(40pt)
      line(length: 100%, stroke: 0.5pt + rgb("#d4cbb3"))
      v(20pt)
      grid(
        columns: (1fr, auto),
        align(left + horizon)[
          #if source != "" [
            #text(size: font-size * 0.75, fill: rgb("#777777"))[摘自《#source》]
          ]
        ],
        align(right + horizon)[
          #if author != "" [
            #text(size: font-size * 0.85, fill: rgb("#555555"))[— #author]
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
    } else {
      align(bottom)[
        #v(1fr)
        #line(length: 100%, stroke: 0.5pt + rgb("#d4cbb3"))
        #v(20pt)
        #grid(
          columns: (1fr, auto),
          align(left + horizon)[
            #if source != "" [
              #text(size: font-size * 0.75, fill: rgb("#777777"))[摘自《#source》]
            ]
          ],
          align(right + horizon)[
            #if author != "" [
              #text(size: font-size * 0.85, fill: rgb("#555555"))[— #author]
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
}

