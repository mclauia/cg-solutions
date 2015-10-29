/*
    CGX FORMATTER problem

    Given an input of well-formed but questionably-white-spaced CGX (a made-up format), print the correct formatting,
        where ELEMENTS separated by ; are siblings, PRIMITIVES are of a set of known types, KEY_VALUES are string ids separated from
        a primitive or block by =, and BLOCKS are nested collections of the above,
        formatting them in their nested layout with proper indentation and linebreaks.

    We read in the initial input to a root element of a CGX tree, and as we read in values and break them apart into elements,
        create nodes with the appropriate type, which continues to break down any block/keyvalue nesting.

    Once we have our CGXTree, we have a data structure we can manipulate if we wanted to, and can then turn around and re-output it
        using getOutput (where each CGX type defines its own output format) to do our formatting work.
*/
var N = parseInt(readline()),
    i,
    cGXInput = '',
    output = '',
    root,
    CGXTree = function(input) {
        this.children = [];
        this.parseInput = function(input) {
            var elements = this.getElementsFromContent(input);
            this.children = elements;
        }

        this.getOutput = function(currentIndent) {
            var output = [], child, currentIndent = currentIndent || 0, i;

            for (i = 0; i < this.children.length; i++) {
                child = this.children[i];
                output = output.concat(child.getOutput(currentIndent));
                if (i < this.children.length-1) {
                    output[output.length-1] += ';';
                }
            };

            return output;
        }
    },

    PrimitiveElement = function(value) {
        this.type = 'primitive';
        this.value = value;
    },

    BlockElement = function(contents) {
        this.type = 'block';
        this.children = this.getElementsFromContent(contents);
    },

    KeyValueElement = function(key, value) {
        this.type = 'key_value';
        this.key = key;
        this.children = [this.getElementData(value)];
    };

BlockElement.prototype = new CGXTree();
BlockElement.prototype.getOutput = function(currentIndent) {
    var output = [], child, currentIndent = currentIndent || 0, i;

    output.push(this.getTabSpacesForIndent(currentIndent) + '(');
    for (i = 0; i < this.children.length; i++) {
        child = this.children[i];
        output = output.concat(child.getOutput(currentIndent+1));

        if (i < this.children.length-1) {
            output[output.length-1] += ';';
        }
    };
    output.push(this.getTabSpacesForIndent(currentIndent) + ')');

    return output;
}

PrimitiveElement.prototype = new CGXTree();
PrimitiveElement.prototype.getOutput = function(currentIndent) {
    return [this.getTabSpacesForIndent(currentIndent) + this.value];
}

KeyValueElement.prototype = new CGXTree();
KeyValueElement.prototype.getOutput = function(currentIndent) {
    var output = [], child = this.children[0], currentIndent = currentIndent || 0, i;

    if (child.type == 'block') {
        output.push(this.getTabSpacesForIndent(currentIndent) + this.key + '=');
        output = output.concat(child.getOutput(currentIndent));
        output[output.length-1];
    } else {
        output.push(
            this.getTabSpacesForIndent(currentIndent)
            + this.key + '=' + child.getOutput(0).join('')
        )
    }
    return output;
}

// splits elements by ;, and gets element data for each one
CGXTree.prototype.getElementsFromContent = function(content) {
    var elements = [],
        self = this,
        parens = 0,
        apostrophes = 0,
        elIndex = 0,
        slices = [],
        i;

    content = content.trim();

    // separate elements, accounting for parens
    // if only we could do this elegantly (and for unknown levels of nesting) with regex :(
    for (i = 0; i < content.length; i++) {
        if (content[i] == '\'') apostrophes++;
        if (apostrophes % 2 == 0) { // if we aren't between string apostrophes
            if (content[i] == '(') parens++;
            if (content[i] == ')') {
                parens--;
                if (parens == 0) {
                    slices.push([elIndex, i+1]);
                    elIndex = i+1;
                }
            }
            if (content[i] == ';' && parens == 0) {
                if (elIndex == i) {
                    elIndex++;
                } else {
                    slices.push([elIndex, i]);
                    elIndex = i+1;
                }
            }
        }
    };
    if (elIndex != content.length) {
        slices.push([elIndex, content.length]);
    }
    for (i = 0; i < slices.length; i++) {
        elements.push(self.getElementData(
            content.slice(slices[i][0], slices[i][1])
        ));
    };

    return elements;
};
CGXTree.prototype.rxs = {
    block: /^\((.*)\)$/,
    primitive: /^(\d+|true|false|null|\'[^\']*\')$/,
    key_value: /^(\'.*?\').*?[\s]*?=[\s]*?(.*)$/
};

// gets the type and data for one element
CGXTree.prototype.getElementData = function(contents) {
    contents = contents.trim();
    var match, matched1, matched2;

    if (match = contents.match(this.rxs.block)) {
        matched1 = match[1];
        return new BlockElement(matched1);
    } else if (match = contents.match(this.rxs.primitive)) {
        matched1 = match[1];
        return new PrimitiveElement(matched1);
    } else if (match = contents.match(this.rxs.key_value)) {
        matched1 = match[1];
        matched2 = match[2];
        return new KeyValueElement(matched1, matched2);
    }
};

// multiply 4-space tabs
CGXTree.prototype.getTabSpacesForIndent = function(indent) {
    var out = '', i;
    for (i = 0; i < indent; i++) {
        out += '    ';
    };
    return out;
}

// read input
for (i = 0; i < N; i++) {
    cGXInput += readline();
}
cGXInput = cGXInput.trim();

// create our CGX tree
root = new CGXTree();

root.parseInput(cGXInput);

output = root.getOutput();
for (i = 0; i < output.length; i++) {
    print(output[i]);
};