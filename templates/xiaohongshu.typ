#let card(
  width: 1080pt,
  height: 1440pt,
  title: "",
  author: "",
  source: "",
  font-family: "Sans-Serif",
  font-size: 28pt,
  line-height: 0.7em,
  par-spacing: 1.7em,
  bg-color: none,
  first-line-indent: 0pt,
  justify: false,
  body
) = {
  let default-bg = rgb("#FFF3CD")
  let page-bg = if bg-color != none { bg-color } else { default-bg }
  set page(
    width: width,
    height: height,
    margin: 0pt,
    fill: page-bg,
  )
  set text(
    font: (font-family, "DejaVu Sans", "DejaVu Serif", "Droid Sans Fallback"),
    size: font-size,
    fill: rgb("#1a1a1a"),
  )
  set par(
    leading: line-height,
    spacing: par-spacing,
    justify: justify,
    first-line-indent: first-line-indent,
  )

  // Top header area (only if title is provided)
  if title != "" {
    rect(
      width: 100%,
      fill: rgb("#FF6B6B"),
      inset: (x: 60pt, y: 44pt)
    )[
      #align(center + horizon)[
        #text(size: font-size * 1.6, weight: "bold", fill: white, title)
      ]
    ]
  }

  // Main content area
  pad(
    left: 60pt,
    right: 60pt,
    top: if title != "" { 48pt } else { 80pt },
    bottom: if (author != "" or source != "") and height == auto { 20pt } else if author != "" or source != "" { 40pt } else { 80pt }
  )[
    #body
  ]

  // Footer (only if author or source is provided)
  if author != "" or source != "" {
    if height == auto {
      pad(x: 60pt, bottom: 40pt)[
        #grid(
          columns: (1fr, auto),
          align(left + horizon)[
            #if source != "" [
              #text(size: font-size * 0.75, fill: rgb("#777777"))[来源: #source]
            ]
          ],
          align(right + horizon)[
            #if author != "" [
              #grid(
                columns: (auto, auto),
                gutter: 14pt,
                circle(radius: 16pt, fill: rgb("#FF6B6B")),
                align(horizon)[
                  #text(size: font-size * 0.85, weight: "bold", author)
                ]
              )
            ]
          ]
        )
      ]
    } else {
      align(bottom)[
        #pad(x: 60pt, y: 36pt)[
          #grid(
            columns: (1fr, auto),
            align(left + horizon)[
              #if source != "" [
                #text(size: font-size * 0.75, fill: rgb("#777777"))[来源: #source]
              ]
            ],
            align(right + horizon)[
              #if author != "" [
                #grid(
                  columns: (auto, auto),
                  gutter: 14pt,
                  circle(radius: 16pt, fill: rgb("#FF6B6B")),
                  align(horizon)[
                    #text(size: font-size * 0.85, weight: "bold", author)
                  ]
                )
              ]
            ]
          )
        ]
      ]
    }
  }
}

