#let card(
  width: 1080pt,
  height: 1440pt,
  title: "",
  author: "",
  font-family: "Sans-Serif",
  body
) = {
  set page(
    width: width,
    height: height,
    margin: 0pt,
    fill: rgb("#FFF3CD"),
  )
  set text(
    font: font-family,
    size: 28pt,
    fill: rgb("#1a1a1a"),
  )
  set par(
    leading: 1.5em,
  )

  // Top header area
  rect(
    width: 100%,
    height: 15%,
    fill: rgb("#FF6B6B"),
    inset: (x: 60pt, y: 40pt)
  )[
    #align(horizon)[
      #text(size: 48pt, weight: "bold", fill: white, title)
    ]
  ]

  // Main content area
  pad(x: 60pt, y: 60pt)[
    #body
  ]

  // Footer
  align(bottom)[
    #pad(x: 60pt, y: 40pt)[
      #grid(
        columns: (auto, auto),
        gutter: 20pt,
        circle(radius: 20pt, fill: rgb("#cccccc")),
        align(horizon)[
          #text(size: 24pt, weight: "bold", author)
        ]
      )
    ]
  ]
}
