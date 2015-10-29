/*
    "Genome Sequencing" problem

    Given a set of N gene sequences (e.g. N is 3, with sequences AA, ACT, TT)
        find the shortest total gene sequence that contains each of the input sequences in any overlapping order
        (e.g. AA
               ACT
                 TT
              AACTT -> 5 characters
        )

    This solution represents each of the input sequences as a node in a graph,
        and w-character left-right overlap as the weight of a directed edge between those nodes.
    This results in a directed weighted possibly-cyclic graph.
    To find the shortest length of the total sequence, perform an all-pairs longest path search, where
        our answer is the highest resulting number of overlapping characters subtracted
        from the length of all input sequences concat'd together.
*/
var N = parseInt(readline()),
    SequenceGraph = new (function() { // singleton graph
        var sequences = [],
            overlaps = []; // arrays of {r: <right sequence>, w: <charssaved weight>}
        // each sequence can be represented as a node of the graph
        this.addSeq = function(seq) {
            sequences.push(seq);
        }
        this.removeSeq = function(seq) {
            var index = sequences.indexOf(seq);
            if (index > -1) sequences.splice(index, 1);
        }
        this.getSeqs = function() {
            return sequences;
        }
        // overlaps are directed edges that represent left-right character overlap between two sequences,
        // where w is the number of overlapping characters
        this.addOverlap = function(a, b, w) {
            var aIndex = sequences.indexOf(a);
            overlaps[aIndex] = overlaps[aIndex] || [];
            overlaps[aIndex].push({r: sequences.indexOf(b), w: w});
        }
        this.getOverlaps = function() {
            return overlaps;
        }
        // find longest path length between all pairs
        this.getBestSequenceLength = function() {
            var best = 0,
                queue,
                discovered,
                processed,
                current,
                charsSaved,
                ttvCharsSaved,
                mostCharsSaved,
                i, j, k, sequence, overlap;

            // easiest case: no overlaps
            if (overlaps.length == 0) {
                return sequences.join('').length;
            }

            // all-pairs search BEGIN
            for (i = 0; i < sequences.length; i++) {
                sequence = sequences[i];
                queue = [i];
                discovered = [];
                processed = [];
                charsSaved = [];

                for (j = 0; j < sequences.length; j++) {
                    charsSaved[j] = 0;
                }

                // @todo this does not appear in any of the test cases, but:
                // if at the end of this while loop we have any non-processed nodes left,
                // and those nodes form disconnected components with overlaps, then we need to restart this and add
                // the other component totals to our best sequence length

                // find highest character savings so far
                while (typeof (currentIndex = queue.shift()) !== 'undefined') {
                    // do we have any outbound edges?
                    if (typeof overlaps[currentIndex] !== 'undefined') {
                        // loop through overlaps and assign tentative charsSaved
                        for (k = 0; k < overlaps[currentIndex].length; k++) {
                            overlap = overlaps[currentIndex][k];
                            if (processed[overlap.r]) continue;

                            ttvCharsSaved = charsSaved[currentIndex] + overlap.w;
                            if (ttvCharsSaved > charsSaved[overlap.r]) {
                                charsSaved[overlap.r] = ttvCharsSaved;
                            }

                            if (!discovered[overlap.r]) {
                                discovered[overlap.r] = true;
                                queue.push(overlap.r);
                            }
                        }

                        queue.sort(function(a,b) {
                            return charsSaved[b] - charsSaved[a];
                        })
                    }
                    processed[currentIndex] = true;
                }

                // find the sequence with most chars saved
                for (j = 0; j < charsSaved.length; j++) {
                    if (!mostCharsSaved || mostCharsSaved < charsSaved[j]) {
                        mostCharsSaved = charsSaved[j];
                    }
                };
                // if that's the best we've found so far amongst pairs already searched, save it
                if (!best || best < mostCharsSaved) {
                    best = mostCharsSaved;
                }
            }
            return sequences.join('').length - best;
        }
    }),
    // vars for preprocessing
    current,
    sequence,
    i,
    register,
    sequences = [];

// add sequences to our graph
for (i = 0; i < N; i++) {
    sequences.push(readline());
    SequenceGraph.addSeq(sequences[i]);
}

// sort by length, for highest chance of eliminating substrings early on
sequences.sort(function(a,b) {
    return a.length - b.length;
})

// pre-processing: search for complete substrings, compare left/right overlaps, add edges to graph
while (current = sequences.pop()) {
    i = sequences.length,
        charsSaved = 0;

    while (i--) {
        sequence = sequences[i];
        // this is a complete substring; we do not need to worry about it
        if (current.indexOf(sequence) > -1) {
            sequences.splice(i, 1);
            SequenceGraph.removeSeq(sequence);
        } else {
            register = sequence.length;

            // sequence -> current overlap
            charsSaved = 0;
            while (register) {
                if (sequence.slice(sequence.length-register) == current.slice(0, register)) {
                    if (register > Math.abs(charsSaved)) {
                        charsSaved = register;
                    }
                }
                register--;
            }
            if (charsSaved > 0) SequenceGraph.addOverlap(sequence, current, charsSaved);

            register = 0; // thisll be zero anyway after previous loop, but just in case you change something...
            charsSaved = 0;
            // current -> sequence overlap
            while (register < sequence.length) {
                if (current.slice(current.length-register) == sequence.slice(0, register)) {
                    if (register > Math.abs(charsSaved)) {
                        charsSaved = register;
                    }
                }
                register++;
            }
            if (charsSaved > 0) SequenceGraph.addOverlap(current, sequence, charsSaved);
        }
    }
}

print(SequenceGraph.getBestSequenceLength());