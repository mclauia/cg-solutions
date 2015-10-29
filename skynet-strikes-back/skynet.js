/*
    "Skynet Strikes Back" problem

    Given a network of plain nodes and "gateway" nodes connected by undirected edges,
        and a "skynet agent" who begins on a given node,
        and the ability to break any edge between a gateway and a neighboring node once per game loop,
        and assuming that a plain node can only have up to 2 gateway neighbors,
        and that the agent will move once per game loop after we break an edge, and that it
            will attempt to move towards the nearest gateway...

        ...find an edge to break each game loop so that the agent never reaches a gateway

    In other words, we need to race the skynet agent to "forked" nodes with 2 gates as neighbors,
        because we can always break a single gate neighbor edge when the agent is on a node adjacent to that gate.

    This solution uses a BFS-based algorithm that assumes the agent chases the nearest gate,
        so it steps through neighbors of a node, finds out if any of THEIR neighbors
        are gates, and shortcircuits the queue to start processing those as new possible start points.

        If only one gate neighbor is found (i.e. we've broken all forks), we mark it as our output.
        If two gate neighbors are found, we know this is the closest fork that the agent will encounter,
        and so halt the search and break one of the nodes connected to that.

*/
var inputs = readline().split(' '),
    N = parseInt(inputs[0]), // the total number of nodes in the level, including the gateways
    L = parseInt(inputs[1]), // the number of links
    E = parseInt(inputs[2]), // the number of exit gateways

// undirected graph, no node values, indices only
    SkynetGraph = new (function() {
        var nodes = [];
        var gateways = [];
        this.addNode = function(node) {
            nodes[node] = [];
        }
        this.addEdge = function(a, b) {
            if (!nodes[a]) this.addNode(a);
            if (!nodes[b]) this.addNode(b);
            nodes[a].push(b);
            nodes[b].push(a);
        }
        this.removeEdge = function(a, b) {
            var index;
            if (nodes[a] && (index = nodes[a].indexOf(b)) > -1) nodes[a].splice(index, 1);
            if (nodes[b] && (index = nodes[b].indexOf(a)) > -1) nodes[b].splice(index, 1);
        }
        this.markGate = function(node) {
            gateways.push(node);
        }
        this.getGates = function() {
            return gateways;
        }
        this.isGate = function(node) {
            return gateways.indexOf(node) > -1;
        }
        this.getAdjacentGates = function(node) {
            var gates = [];
            for (var i = 0; i < gateways.length; i++) {
                if (nodes[node].indexOf(gateways[i]) > -1) {
                    gates.push(gateways[i]);
                }
            };
            return gates;
        }
        this.getAdjacents = function(node) {
            if (nodes[node]) return nodes[node];
            throw 'no node to get adjacents: '+ node;
        }
        this.killEdge = function(a, b) {
            this.removeEdge(a,b);
            print(a + ' ' + b);
        }

        this.getNextExitToBreak = function(node) {
            var self = this,
                queue = [],
                discovered = [],
                adjGates,
                current = node,
                out = [],
                adjacentsWithGateNeighbors = []

            discovered[node] = true;
            while (typeof current !== 'undefined') {
                adjGates = [];
                // check for double gates; need to break one of those
                this.getAdjacents(current).forEach(function(adj) {
                    if (!discovered[adj]) {
                        if (self.getAdjacentGates(adj).length) {
                            adjacentsWithGateNeighbors.push(adj);
                        }

                        if (self.isGate(adj)) {
                            adjGates.push(adj);
                        } else {
                            discovered[adj] = true;
                            queue.push(adj);
                        } // do nothing if already explored
                    }
                })

                if (adjGates.length == 2) {
                    adjGates.unshift(current);
                    out = adjGates;
                    break; // we can be sure that the first double gate we encounter in bfs is the closest
                } else if (adjGates.length == 1 && out.length < 2) {
                    adjGates.unshift(current);
                    out = adjGates;
                }
                if (adjacentsWithGateNeighbors.length > 1) {
                    // if an adjacent has 2 gates, make that the only thing in the q
                    queue = adjacentsWithGateNeighbors;
                    adjacentsWithGateNeighbors = [];
                }

                current = queue.shift();
            }

            return out;
        }
    }),
    i,
    inputs,
    N1, N2, EI,
    a = 0,
    b = 0,
    gateWithShortestPath = null,
    shortestPathToAnyGate,
    nextExit,
    done = false;

// read inputs
for (i = 0; i < L; i++) {
    inputs = readline().split(' ');
    N1 = parseInt(inputs[0]); // N1 and N2 defines a link between these nodes
    N2 = parseInt(inputs[1]);
    SkynetGraph.addEdge(N1, N2);
}
for (i = 0; i < E; i++) {
    EI = parseInt(readline()); // the index of a gateway node
    SkynetGraph.markGate(EI);
}

// game loop
while (true) {
    SI = parseInt(readline()); // The index of the node on which the Skynet agent is positioned this turn

    // any agent neighbors gates? then just kill that edge immediately and shortcircuit the game loop
    SkynetGraph.getAdjacents(SI).forEach(function(neighbor) {
        if (SkynetGraph.isGate(neighbor)) {
            done = true;
            SkynetGraph.killEdge(SI, neighbor);
        }
    })
    // find shortest path from agent to all gateways
    if (!done) {
        nextExit = SkynetGraph.getNextExitToBreak(SI);
        SkynetGraph.killEdge(nextExit[0], nextExit[1]);
    }

}