'use strict'

const assignLayers = require('./lib/assign-layers.js')
const digraph = require('digraph-tag')
const test = require('tape')

test('assigns layers to a dag', function(assert) {
  const graph = digraph`
    A -> B
    B -> C
    C -> D
    X -> Y
    Y -> Z
    Z -> D
    D -> U
    U -> V
  `

  const layering = assignLayers(graph.vertices, graph.incoming, graph.outgoing)
  const seen = new Set()

  for (let i = 0; i < layering.length; ++i) {
    let layer = layering[i]
    process.stdout.write(`L${i}: `)
    for (let vertex of layer) {
      process.stdout.write(vertex + ' ')
    }
    console.log()
  }
  for (let i = 0; i < layering.length; ++i) {
    let layer = layering[i]
    for (let vertex of layer) {
      seen.add(vertex)
      let outgoing = graph.outgoing.get(vertex)
      if (!outgoing || !outgoing.size) {
        continue
      }

      for (let edge of outgoing) {
        let name =
          (edge[0].phony ? '*' : edge[0]) + ' → ' +
          (edge[1].phony ? '*' : edge[1])

        let ok = false
        for (let j = i - 1; j > -1; --j) {
          if (layering[j].has(edge[1])) {
            ok = true
            break
          }
        }

        assert.ok(ok, name + ' points to subsequent layer')
      }
    }
  }
  assert.ok(seen.size >= graph.vertices.size, 'we should have at least as many vertices')
  let ok = true
  for (let vertex of graph.vertices) {
    ok = ok && seen.has(vertex)
    if (!ok) break
  }
  assert.ok(ok, 'all original vertices are present')
  assert.end()
})
