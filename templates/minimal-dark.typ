#let card(
  width: 1080pt,
  height: 1080pt,
  title: "",
  author: "",
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
    font: font-family,
    size: 32pt,
    fill: rgb("#c9d1d9"),
  )
  set par(
    leading: 1.6em,
  )

  // Title
  if title != "" {
    text(size: 50pt, weight: "bold", fill: rgb("#58a6ff"), title)
    v(30pt)
  }

  // Body
  body

  // Footer
  align(bottom)[
    #v(1fr)
    #if author != "" [
      #text(size: 24pt, fill: rgb("#8b949e"))[\@#author]
    ]
  ]
}
