# dag-to-layers

Given a directed, acyclic graph, apply a layering. The returned value will be an
array of sets of vertices representing the layer assignments. Edges outgoing from
each layer may only point to vertices from earlier layers.

```javascript
const toLayers = require('dag-to-layers')
const digraph = require('digraph-tag')

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

let layers = toLayers(graph.vertices, graph.incoming, graph.outgoing)

/*
NB: vertex order within a given layer is not guaranteed:

L6: X             X
L5: Y A           |
L4: Z B           Y   A
L3: C             |   |
L2: D             Z   B
L1: U             |   |
L0: V             |   C
                   \ /
                    Y
                    |
                    D
                    |
                    U
                    |
                    V
*/
```

## API

##### `Map<Vertex → Set<Edge>> :: Edges`

A map from `Vertex` to a `Set` of `Edge`s is known as `Edges`.

##### `[Set<Vertex>, ...] :: Layering`

An array representing a valid layering of a graph. From the above example, the layering would 
look something like this:

```
[ Set<V>,  // ← layer zero
  Set<U>,
  Set<D>,
  Set<C>,
  Set<Z, B>,
  Set<Y, A>,
  Set<X> ] // ← layer six
```

##### `assignLayers(v: Set<Vertices>, to: Edges, from: Edges[, i: Interface]) → Layering`

Create a `Layering` from a graph represented by a set of vertices `v`, a map of vertices to incoming edges, a map of vertices to outgoing edges, and an optional interface.

##### `(Edge → Vertex) :: E2V`

A mapping function from edge to vertex.

##### `{[getFrom:E2V][, getTo:E2V]} :: Interface`

An object containing methods necessary for implementing the layer assignment algorithm.
`getFrom` should return the source vertex of an edge, `getTo` should return the destination
vertex.

The default values act as follows:

```javascript
const getFrom = edge => edge[0]
const getTo = edge => edge[1]
```

## License

MIT

