# dag-to-layers

Given a directed, acyclic graph, apply a layering. The returned value will be an
array of sets of vertices representing the layer assignments. The original graph
will be modified such that no edge may "skip" a layer – that is to say, phony
vertices will be added and layer-crossing edges will be split to accomodate this
constraint.

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
NB: vertex order is not guaranteed:

L6: X             X
L5: Y A           |
L4: Z B           Y   A
L3: * C           |   |
L2: D             Z   B
L1: U             |   |
L0: V             *   C
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

An array representing a valid layering of a graph. No edge should be able to cross more than one
layer – they must point to their immediate parent. From the above example, the layering would 
look something like this:

```
[ Set<V>,  // ← layer zero
  Set<U>,
  Set<D>,
  Set<*, C>,
  Set<Z, B>,
  Set<Y, A>,
  Set<X> ] // ← layer six
```

##### `assignLayers(v: mut Set<Vertices>, to: mut Edges, from: mut Edges[, i: Interface]) → Layering`

Create a `Layering` from a graph represented by a set of vertices `v`, a map of vertices to incoming edges, a map of vertices to outgoing edges, and an optional interface.

This may mutate the set of vertices as well as the edge maps, by adding dummy vertices and subdividing layer-spanning edges.

##### `(Edge → Vertex) :: E2V`

A mapping function from edge to vertex.

##### `(Vertex → PhonyVertex) :: MakeP`

A function that takes an originating vertex (for metadata purposes) and creates a phony vertex.

##### `((Edge, Vertex | PhonyVertex, Vertex | PhonyVertex) → Edge) :: MakeE`

A function that takes an originating edge, a source vertex and a destination vertex, and returns
a new `Edge` instance.

##### `{[getFrom:E2V][, getTo:E2V][, makeEdge:MakeE][, makePhony:MakeP]} :: Interface`

An object containing methods necessary for implementing the layer assignment algorithm.
`getFrom` should return the source vertex of an edge, `getTo` should return the destination
vertex. `makeEdge` should create a new edge instance with the provided source and destination
vertices. `makePhony` should return a phony vertex.

The default values act as follows:

```javascript
const getFrom = edge => edge[0]
const getTo = edge => edge[1]
const makePhony = ()=> { return {phony: true}}
const makeEdge = (edge, from, to) => {
  const newEdge = Object.create(edge)
  [newEdge...] = [from, to]
  return newEdge
}
```

## License

MIT

