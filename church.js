/*******************
 * CHURCH BOOLEANS *
 *******************/

const TRUE = x => y => x;
const FALSE = x => y => y;

// church boolean -> JS boolean
const toBoolean = p =>
    p(true)(false);

/*******************
 * NUMERALS        *
 *******************/

const ZERO = f => x => x;
const ONE = f => x => f(x);
const TWO = f => x => f(f(x));
const THREE = f => x => f(f(f(x)));

// church numeral -> JS number
const toInteger = num =>
    num(x => x + 1)(0);

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


const IS_PRIME_REC = Z_COMBINATOR(self =>
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


const IS_PRIME = num =>
    /*if*/LE(num)(ONE) // num <= 1
    /*then*/(
        FALSE
    )
    /*else*/(
        _ => ( // defer evaluation
            IS_PRIME_REC(num)(PRED(num)) // IS_PRIME_REC(num, num - 1)
        )(_)
    );

