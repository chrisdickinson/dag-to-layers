'use strict'

module.exports = assignLayers

const φ = new Set()

function assignLayers(vertices, incoming, outgoing, accessors) {
  accessors       = accessors || {}
  const getFrom   = accessors.getFrom || defaultGetFrom
  const getTo     = accessors.getTo || defaultGetTo

  const candidates = []
  for (let W = 1; W < 5; ++W) {
    for (let C = 1; C < 3; ++C) {
      candidates.push(assignLayerCandidate(vertices, incoming, outgoing, W, C, getTo))
    }
  }

  const candidate = candidates.map(function(xs) {
    return [xs.reduce(function(lhs, rhs) {
      return Math.max(lhs, rhs.size)
    }, -Infinity), xs]
  }).sort(function(lhs, rhs) {
    return lhs[0] < rhs[0] ? -1 : lhs[0] > rhs[0] ? 1 : 0
  })[0][1]

  const layering = new Map()

  for (let i = 0; i < candidate.length; ++i) {
    for (let vertex of candidate[i]) {
      layering.set(vertex, i)
    }
  }

  const promotedLayering = promote(layering, vertices, incoming, outgoing, getFrom)
  const output = []

  for (let tuple of promotedLayering) {
    if (!output[tuple[1]]) {
      output[tuple[1]] = new Set()
    }
    output[tuple[1]].add(tuple[0])
  }

  return output.filter(Boolean)
}


function promoteVertex(vertex, layering, vertices, incoming, outgoing, getFrom) {
  let dummyDiff = 0
  const incomingEdges = incoming.get(vertex) || φ
  const outgoingEdges = outgoing.get(vertex) || φ
  for (let edge of incomingEdges) {
    let source = getFrom(edge)
    if (layering.get(source) === layering.get(vertex) + 1) {
      dummyDiff += promoteVertex(source, layering, vertices, incoming, outgoing, getFrom)
    }
  }
  layering.set(vertex, layering.get(vertex) + 1)

  dummyDiff = dummyDiff -
    (incomingEdges ? incomingEdges.size : 0) +
    (outgoingEdges ? outgoingEdges.size : 0)
  return dummyDiff
}


// pick thinnest of W={1,2,3,4}, c={1,2}
function assignLayerCandidate(vertices, incoming, outgoing, W, c, getTo) {
  const layerBelow = new Set()
  const assigned = new Set()
  const layers = [new Set()]

  let widthCurrent = 0
  let widthUp = 0

  while (assigned.size !== vertices.size) {
    let selected = null
    let selectedDegree = -Infinity
    let okay = true
    for (let vertex of vertices) {
      if (assigned.has(vertex)) {
        continue
      }
      let vertexOutgoing = outgoing.get(vertex)
      let degreeOutgoing = 0
      okay = true

      if (vertexOutgoing) {
        for (let edge of vertexOutgoing) {
          if (!layerBelow.has(getTo(edge))) {
            okay = false
            break
          }
        }

        if (!okay) continue
        degreeOutgoing += vertexOutgoing.size
      }

      if (selectedDegree < degreeOutgoing) {
        selectedDegree = degreeOutgoing
        selected = vertex
      }
    }

    if (selected) {
      layers[layers.length - 1].add(selected)
      assigned.add(selected)
      widthCurrent = widthCurrent - selectedDegree + 1

      let vertexIncoming = incoming.get(selected)
      let vertexOutgoing = outgoing.get(selected)
      let degreeVertexIncoming = 0
      if (vertexIncoming) {
        for (let edge of vertexIncoming) {
          ++degreeVertexIncoming
        }
      }

      widthUp = widthUp + (vertexIncoming ? vertexIncoming.size : 0)
      if ((widthCurrent < W || selectedDegree >= 1) || widthUp < W * c) {
        continue
      }
    }

    widthCurrent = widthUp
    widthUp = 0
    layers.push(new Set())
    for (let vertex of layers[layers.length - 2]) {
      layerBelow.add(vertex)
    }
  }

  return layers
}


function copyLayering(layering) {
  const copy = new Map()
  for (let tuple of layering) {
    copy.set(tuple[0], tuple[1])
  }
  return copy
}


function promote(layering, vertices, incoming, outgoing, getFrom) {
  let layeringBackup = copyLayering(layering)
  let promotions = 0
  do {
    promotions = 0
    for (let vertex of vertices) {
      let incomingEdges = incoming.get(vertex)
      if (incomingEdges && incomingEdges.size) {
        if (promoteVertex(vertex, layering, vertices, incoming, outgoing, getFrom) < 0) {
          layeringBackup = copyLayering(layering)
        } else {
          layering = layeringBackup
        }
      }
    }
  } while (promotions)

  return layering
}



function defaultGetFrom(edge) {
  return edge[0]
}

function defaultGetTo(edge) {
  return edge[1]
}
