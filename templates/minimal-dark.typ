#let card(
  width: 1080pt,
  height: 1080pt,
  title: "",
  author: "",
  source: "",
  font-family: "Sans-Serif",
  font-size: 32pt,
  line-height: 0.75em,
  par-spacing: 1.8em,
  bg-color: none,
  first-line-indent: 0pt,
  justify: false,
  body
) = {
  let default-bg = rgb("#0d1117")
  let page-bg = if bg-color != none { bg-color } else { default-bg }
  set page(
    width: width,
    height: height,
    margin: 80pt,
    fill: page-bg,
  )
  set text(
    font: (font-family, "Droid Sans Fallback"),
    size: font-size,
    fill: rgb("#c9d1d9"),
  )
  set par(
    leading: line-height,
    spacing: par-spacing,
    justify: justify,
    first-line-indent: first-line-indent,
  )

  // Title (optional)
  if title != "" {
    text(size: font-size * 1.5, weight: "bold", fill: rgb("#58a6ff"), title)
    v(30pt)
  }

  // Body
  body

  // Footer (optional)
  if author != "" or source != "" {
    if height == auto {
      v(40pt)
      grid(
        columns: (1fr, auto),
        align(left + horizon)[
          #if source != "" [
            #text(size: font-size * 0.65, fill: rgb("#6e7681"))[#source]
          ]
        ],
        align(right + horizon)[
          #if author != "" [
            #text(size: font-size * 0.75, fill: rgb("#8b949e"))[\@#author]
          ]
        ]
      )
    } else {
      align(bottom)[
        #v(1fr)
        #grid(
          columns: (1fr, auto),
          align(left + horizon)[
            #if source != "" [
              #text(size: font-size * 0.65, fill: rgb("#6e7681"))[#source]
            ]
          ],
          align(right + horizon)[
            #if author != "" [
              #text(size: font-size * 0.75, fill: rgb("#8b949e"))[\@#author]
            ]
          ]
        )
      ]
    }
  }
}

