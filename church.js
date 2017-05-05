/*******************
 * CHURCH BOOLEANS *
 *******************/

const TRUE = x => y => x;
const FALSE = x => y => y;

// church boolean -> JS boolean
function decodeChurchBoolean(p) {
    return p(true)(false);
}
// JS boolean -> church boolean
function makeChurchBoolean(b) {
    return b ? TRUE : FALSE;
}

/*******************
 * CHURCH NUMERALS *
 *******************/

const ZERO = f => x => x;
const ONE = f => x => f(x);
const TWO = f => x => f(f(x));
const THREE = f => x => f(f(f(x)));

// church numeral -> JS number
function decodeChurchNumeral(num) {
    return num(x => x + 1)(0);
}
// JS number -> church numeral
function makeChurchNumeral(n) {
    if (n <= 0) return ZERO;
    else return SUCC(makeChurchNumeral(n - 1));
}

/*********************
 * LOGICAL OPERATORS *
 *********************/

const AND = p => q =>
    /*if*/p/*then*/(q)/*else*/(FALSE);

const OR = p => q =>
    /*if*/p/*then*/(TRUE)/*else*/(q);

const NOT = p =>
    /*if*/p/*then*/(FALSE)/*else*/(TRUE);

// Booleans Equal (a.k.a. XNOR) (==)
const BOOL_EQ = p => q =>
    /*if*/p/*then*/(q)/*else*/( NOT(q) );

// Booleans Not Equal (a.k.a. XOR) (!=)
const BOOL_NE = p => q =>
    NOT( BOOL_EQ(p)(q) );

/************************
 * ARITHMETIC OPERATORS *
 ************************/

// Successor
const SUCC = num =>
    f => x =>
        f( num(f)(x) );

// Predecessor
const PRED = num =>
    f => x =>
        num( g => h => h(g(f)) )( u => x )( u => u );

// Add
const ADD = lhs => rhs =>
    rhs(SUCC)(lhs);

// Subtract
const SUB = lhs => rhs =>
    rhs(PRED)(lhs);

// Multiply
const MUL = lhs => rhs =>
    f =>
        lhs( rhs(f) );

// Exponentiation
const EXP = lhs => rhs =>
    rhs(lhs);

/************************
 * RELATIONAL OPERATORS *
 ************************/

// Equal Zero
const EQ_ZERO = num =>
    num(_ => FALSE)(TRUE);

// Less or Equal (<=)
const LE = lhs => rhs =>
    EQ_ZERO( SUB(lhs)(rhs) );

// Greater or Equal (>=)
const GE = lhs => rhs =>
    LE(rhs)(lhs);

// Less Than (<)
const LT = lhs => rhs =>
    NOT( GE(lhs)(rhs) );

// Greater Than (>)
const GT = lhs => rhs =>
    LT(rhs)(lhs);

// Numerals Equal (==)
const NUM_EQ = lhs => rhs =>
    AND( LE(lhs)(rhs) )( GE(lhs)(rhs) );

// Numerals Not Equal (!=)
const NUM_NE = lhs => rhs =>
    NOT( NUM_EQ(lhs)(rhs) );

/***************
 * COMBINATORS *
 ***************/

// Z combinator
const Z_COMBINATOR = f =>
    ( x => f(_ => x(x)(_)) )( x => f(_ => x(x)(_)) );

/*********************************
 * ADVANCED ARITHMETIC OPERATORS *
 *********************************/

// Modulo
const MOD = Z_COMBINATOR(self =>
    lhs => rhs =>
        /*if*/GE(lhs)(rhs) // lhs >= rhs
        /*then*/(
            _ => ( // defer evaluation
                self( SUB(lhs)(rhs) )(rhs) // mod(lhs - rhs, rhs)
            )(_)
        )
        /*else*/(
            lhs
        )
);

/***************
 * LISTS       *
 ***************/

// List node (implemented as a triple)
const _LIST_NODE = is_nil => head => tail =>
    f => f(is_nil)(head)(tail);

const IS_NIL = list =>
    list(
        is_nil => head => tail =>
            is_nil
    );

const HEAD = list =>
    list(
        is_nil => head => tail =>
            head
    );

const TAIL = list =>
    list(
        is_nil => head => tail =>
            tail
    );

const CONS = value => list =>
    _LIST_NODE(FALSE)(value)(list);

const NIL = _LIST_NODE(TRUE)(_ => _)(_ => _);

// church list -> JS array
function decodeChurchList(list) {
    let array = [];

    while (!decodeChurchBoolean(IS_NIL(list))) {
        array.push(HEAD(list));
        list = TAIL(list);
    }
    return array;
}
// JS array -> churchList
function makeChurchList(array) {
    let list = NIL;
    for (let el of array) {
        list = CONS(el)(list);
    }
    return list;
}

/******************
 * LIST FUNCTIONS *
 ******************/

const FOLDL = Z_COMBINATOR(self =>
    init => list => f =>
        /*if*/IS_NIL(list)
        /*then*/(init)
        /*else*/(
            _ => ( // defer evaluation
                self( f(init)(HEAD(list)) )( TAIL(list) )(f)
            )(_)
        )
);

const FOLDR = Z_COMBINATOR(self =>
    init => list => f =>
        /*if*/IS_NIL(list)
        /*then*/(init)
        /*else*/(
            _ => ( // defer evaluation
                f( HEAD(list) )( self(init)(TAIL(list))(f) )
            )(_)
        )
);

const MAP = list => f =>
    FOLDR(NIL)(list)( l => r => CONS(f(l))(r) );

const FILTER = list => f =>
    FOLDR(NIL)(list)( l => r =>
        /*if*/f(l)
        /*then*/( CONS(l)(r) )
        /*else*/(r)
    );

const RANGE = Z_COMBINATOR(self =>
    start => end =>
        /*if*/LE(start)(end)
        /*then*/(
            _ => ( // defer evaluation
                CONS(start)( self(SUCC(start))(end) )
            )(_)
        )
        /*else*/(NIL)
);


/*******************
 * DEMO ALGORITHMS *
 *******************/

// Fibonacci numbers
const FIB = Z_COMBINATOR(self =>
    n =>
        /*if*/LE(n)(ONE)
    /*then*/(
        n // FIB(0) == 0, FIB(1) == 1
    )
    /*else*/(
        _ => ( // defer evaluation
            ADD( self(PRED(n)) )( self(PRED(PRED(n))) ) // FIB(n-1) + FIB(n-2)
        )(_)
    )
);


const _IS_PRIME_REC = Z_COMBINATOR(self =>
    n => d =>
        /*if*/LE(d)(ONE) // d <= 1
        /*then*/(
            TRUE
        )
        /*else*/(
            /*if*/EQ_ZERO( MOD(n)(d) ) // n % d == 0
            /*then*/(
                FALSE
            )
            /*else*/(
                _ => ( // defer evaluation
                    self(n)( PRED(d) ) // isPrimeRec(n, d - 1)
                )(_)
            )
        )
);

// Primality test
const IS_PRIME = n =>
    /*if*/LE(n)(ONE) // n <= 1
    /*then*/(
        FALSE
    )
    /*else*/(
        _ => ( // defer evaluation
            _IS_PRIME_REC(n)(PRED(n)) // IS_PRIME_REC(n, n - 1)
        )(_)
    );
