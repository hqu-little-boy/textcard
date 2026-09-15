#let card(
  width: 1080pt,
  height: 1440pt,
  title: "",
  author: "",
  source: "",
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

  // Top header area (only if title is provided)
  if title != "" {
    rect(
      width: 100%,
      fill: rgb("#FF6B6B"),
      inset: (x: 60pt, y: 44pt)
    )[
      #align(center + horizon)[
        #text(size: 46pt, weight: "bold", fill: white, title)
      ]
    ]
  }

  // Main content area
  pad(
    left: 60pt,
    right: 60pt,
    top: if title != "" { 48pt } else { 80pt },
    bottom: if author != "" or source != "" { 40pt } else { 80pt }
  )[
    #body
  ]

  // Footer (only if author or source is provided)
  if author != "" or source != "" {
    align(bottom)[
      #pad(x: 60pt, y: 36pt)[
        #grid(
          columns: (1fr, auto),
          align(left + horizon)[
            #if source != "" [
              #text(size: 22pt, fill: rgb("#777777"))[来源: #source]
            ]
          ],
          align(right + horizon)[
            #if author != "" [
              #grid(
                columns: (auto, auto),
                gutter: 14pt,
                circle(radius: 16pt, fill: rgb("#FF6B6B")),
                align(horizon)[
                  #text(size: 24pt, weight: "bold", author)
                ]
              )
            ]
          ]
        )
      ]
    ]
  }
}
