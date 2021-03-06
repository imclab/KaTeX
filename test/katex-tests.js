var buildTree = require("../buildTree");
var parseTree = require("../parseTree");

describe("A parser", function() {
    it("should not fail on an empty string", function() {
        expect(function() {
            parseTree("");
        }).not.toThrow();
    });

    it("should ignore whitespace", function() {
        var parseA = parseTree("    x    y    ");
        var parseB = parseTree("xy");
        expect(parseA).toEqual(parseB);
    });
});

describe("An ord parser", function() {
    var expression = "1234|/@.\"`abcdefgzABCDEFGZ";

    it("should not fail", function() {
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of ords", function() {
        var parse = parseTree(expression);

        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("ord");
        }
    });

    it("should parse the right number of ords", function() {
        var parse = parseTree(expression);

        expect(parse.length).toBe(expression.length);
    });
});

describe("A bin parser", function() {
    var expression = "+-*\\cdot\\pm\\div";

    it("should not fail", function() {
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of bins", function() {
        var parse = parseTree(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("bin");
        }
    });
});

describe("A rel parser", function() {
    var expression = "=<>\\leq\\geq\\neq\\nleq\\ngeq\\cong";

    it("should not fail", function() {
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of rels", function() {
        var parse = parseTree(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("rel");
        }
    });
});

describe("A punct parser", function() {
    var expression = ",;\\colon";

    it("should not fail", function() {
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of puncts", function() {
        var parse = parseTree(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("punct");
        }
    });
});

describe("An open parser", function() {
    var expression = "([";

    it("should not fail", function() {
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of opens", function() {
        var parse = parseTree(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("open");
        }
    });
});

describe("A close parser", function() {
    var expression = ")]?!";

    it("should not fail", function() {
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should build a list of closes", function() {
        var parse = parseTree(expression);
        expect(parse).toBeTruthy();

        for (var i = 0; i < parse.length; i++) {
            var group = parse[i];
            expect(group.type).toMatch("close");
        }
    });
});

describe("A subscript and superscript parser", function() {
    it("should not fail on superscripts", function() {
        expect(function() {
            parseTree("x^2");
        }).not.toThrow();
    });

    it("should not fail on subscripts", function() {
        expect(function() {
            parseTree("x_3");
        }).not.toThrow();
    });

    it("should not fail on both subscripts and superscripts", function() {
        expect(function() {
            parseTree("x^2_3");
        }).not.toThrow();

        expect(function() {
            parseTree("x_2^3");
        }).not.toThrow();
    });

    it("should not fail when there is no nucleus", function() {
        expect(function() {
            parseTree("^3");
        }).not.toThrow();

        expect(function() {
            parseTree("_2");
        }).not.toThrow();

        expect(function() {
            parseTree("^3_2");
        }).not.toThrow();

        expect(function() {
            parseTree("_2^3");
        }).not.toThrow();
    });

    it("should produce supsubs for superscript", function() {
        var parse = parseTree("x^2")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeUndefined();
    });

    it("should produce supsubs for subscript", function() {
        var parse = parseTree("x_3")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sub).toBeDefined();
        expect(parse.value.sup).toBeUndefined();
    });

    it("should produce supsubs for ^_", function() {
        var parse = parseTree("x^2_3")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeDefined();
    });

    it("should produce supsubs for _^", function() {
        var parse = parseTree("x_3^2")[0];

        expect(parse.type).toBe("supsub");
        expect(parse.value.base).toBeDefined();
        expect(parse.value.sup).toBeDefined();
        expect(parse.value.sub).toBeDefined();
    });

    it("should produce the same thing regardless of order", function() {
        var parseA = parseTree("x^2_3");
        var parseB = parseTree("x_3^2");

        expect(parseA).toEqual(parseB);
    });

    it("should not parse double subscripts or superscripts", function() {
        expect(function() {
            parseTree("x^x^x");
        }).toThrow();

        expect(function() {
            parseTree("x_x_x");
        }).toThrow();

        expect(function() {
            parseTree("x_x^x_x");
        }).toThrow();

        expect(function() {
            parseTree("x_x^x^x");
        }).toThrow();

        expect(function() {
            parseTree("x^x_x_x");
        }).toThrow();

        expect(function() {
            parseTree("x^x_x^x");
        }).toThrow();
    });

    it("should work correctly with {}s", function() {
        expect(function() {
            parseTree("x^{2+3}");
        }).not.toThrow();

        expect(function() {
            parseTree("x_{3-2}");
        }).not.toThrow();

        expect(function() {
            parseTree("x^{2+3}_3");
        }).not.toThrow();

        expect(function() {
            parseTree("x^2_{3-2}");
        }).not.toThrow();

        expect(function() {
            parseTree("x^{2+3}_{3-2}");
        }).not.toThrow();

        expect(function() {
            parseTree("x_{3-2}^{2+3}");
        }).not.toThrow();

        expect(function() {
            parseTree("x_3^{2+3}");
        }).not.toThrow();

        expect(function() {
            parseTree("x_{3-2}^2");
        }).not.toThrow();
    });
});

describe("A subscript and superscript tree-builder", function() {
    it("should not fail when there is no nucleus", function() {
        expect(function() {
            buildTree(parseTree("^3"));
        }).not.toThrow();

        expect(function() {
            buildTree(parseTree("_2"));
        }).not.toThrow();

        expect(function() {
            buildTree(parseTree("^3_2"));
        }).not.toThrow();

        expect(function() {
            buildTree(parseTree("_2^3"));
        }).not.toThrow();
    });
});

describe("A group parser", function() {
    it("should not fail", function() {
        expect(function() {
            parseTree("{xy}");
        }).not.toThrow();
    });

    it("should produce a single ord", function() {
        var parse = parseTree("{xy}");

        expect(parse.length).toBe(1);

        var ord = parse[0];

        expect(ord.type).toMatch("ord");
        expect(ord.value).toBeTruthy();
    });
});

describe("A function parser", function() {
    it("should parse no argument functions", function() {
        expect(function() {
            parseTree("\\div");
        }).not.toThrow();
    });

    it("should parse 1 argument functions", function() {
        expect(function() {
            parseTree("\\blue x");
        }).not.toThrow();
    });

    it("should parse 2 argument functions", function() {
        expect(function() {
            parseTree("\\frac 1 2");
        }).not.toThrow();
    });

    it("should not parse 1 argument functions with no arguments", function() {
        expect(function() {
            parseTree("\\blue");
        }).toThrow();
    });

    it("should not parse 2 argument functions with 0 or 1 arguments", function() {
        expect(function() {
            parseTree("\\frac");
        }).toThrow();

        expect(function() {
            parseTree("\\frac 1");
        }).toThrow();
    });

    it("should not parse a function with text right after it", function() {
        expect(function() {
            parseTree("\\redx");
        }).toThrow();
    });

    it("should parse a function with a number right after it", function() {
        expect(function() {
            parseTree("\\frac12");
        }).not.toThrow();
    });

    it("should parse some functions with text right after it", function() {
        expect(function() {
            parseTree("\\;x");
        }).not.toThrow();
    });
});

describe("A frac parser", function() {
    var expression = "\\frac{x}{y}";
    var dfracExpression = "\\dfrac{x}{y}";
    var tfracExpression = "\\tfrac{x}{y}";

    it("should not fail", function() {
        expect(function() {
            parseTree(expression);
        }).not.toThrow();
    });

    it("should produce a frac", function() {
        var parse = parseTree(expression)[0];

        expect(parse.type).toMatch("frac");
        expect(parse.value.numer).toBeDefined();
        expect(parse.value.denom).toBeDefined();
    });

    it("should also parse dfrac and tfrac", function() {
        expect(function() {
            parseTree(dfracExpression);
        }).not.toThrow();

        expect(function() {
            parseTree(tfracExpression);
        }).not.toThrow();
    });

    it("should parse dfrac and tfrac as fracs", function() {
        var dfracParse = parseTree(dfracExpression)[0];

        expect(dfracParse.type).toMatch("frac");
        expect(dfracParse.value.numer).toBeDefined();
        expect(dfracParse.value.denom).toBeDefined();

        var tfracParse = parseTree(tfracExpression)[0];

        expect(tfracParse.type).toMatch("frac");
        expect(tfracParse.value.numer).toBeDefined();
        expect(tfracParse.value.denom).toBeDefined();
    });
});
