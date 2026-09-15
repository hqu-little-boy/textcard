#let card(
  width: 1080pt,
  height: 1080pt,
  title: "",
  author: "",
  source: "",
  font-family: "Sans-Serif",
  body
) = {
  set page(
    width: width,
    height: height,
    margin: 80pt,
    fill: rgb("#0d1117"),
  )
  set text(
    font: (font-family, "Droid Sans Fallback"),
    size: 32pt,
    fill: rgb("#c9d1d9"),
  )
  set par(
    leading: 1.6em,
  )

  // Title (optional)
  if title != "" {
    text(size: 48pt, weight: "bold", fill: rgb("#58a6ff"), title)
    v(30pt)
  }

  // Body
  body

  // Footer (optional)
  if author != "" or source != "" {
    align(bottom)[
      #v(1fr)
      #grid(
        columns: (1fr, auto),
        align(left + horizon)[
          #if source != "" [
            #text(size: 20pt, fill: rgb("#6e7681"))[#source]
          ]
        ],
        align(right + horizon)[
          #if author != "" [
            #text(size: 24pt, fill: rgb("#8b949e"))[\@#author]
          ]
        ]
      )
    ]
  }
}
