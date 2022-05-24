/**
 * @param {function(...?):?} fn - function with a fixed number of parameters
 * @return {function(...?):?}
 */
const curry = fn => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length < arity) {
      return curried.bind(null, ...args);
    }
    return fn(...args);
  };
};

const sum = (a, b, c) => a + b + c;
const curriedSum = curry(sum);

console.log(curriedSum(1)(2)(3));
console.log(sum(5, 4, 1) === curriedSum(5)(4)(1));

// ===========================================

class Pizza {
  constructor(size, crust, sauce) {
    this.size = size;
    this.crust = crust;
    this.sauce = sauce;
    this.toppings = [];
  }

  prepare() {
    console.log('prepeare');
  }

  bake() {
    console.log('bake');
  }

  ready() {
    console.log('ready');
  }
}

// ===========================================

class Salad {
  constructor(size, dressing) {
    this.size = size;
    this.dressing = dressing;
  }

  prepare() {
    console.log('prepeare');
  }

  toss() {
    console.log('toss');
  }

  ready() {
    console.log('ready');
  }
}

// ===========================================

class StuffedCrustPizza extends Pizza {
  stuff() {
    console.log('stuff');
  }
}

// ===========================================

class ButteredCrustPizza extends Pizza {
  butter() {
    console.log('butter');
  }
}

// ===========================================

class StuffedButteredCrustPizza extends Pizza {
  stuff() {
    console.log('stuff');
  }

  butter() {
    console.log('butter');
  }
}

const p1 = new StuffedButteredCrustPizza('large', 'thin', 'marinara');
p1.prepare();
p1.bake();

// ===========================================

const prepare = () => {
  return {
    prepare: () => {
      console.log('prepeare');
    }
  };
};

const bake = () => {
  return {
    bake: () => {
      console.log('bake');
    }
  };
};

const ready = () => {
  return {
    ready: () => {
      console.log('ready');
    }
  };
};

const toss = () => {
  return {
    toss: () => {
      console.log('toss');
    }
  };
};

const stuff = () => {
  return {
    stuff: () => {
      console.log('stuff');
    }
  };
};

const butter = () => {
  return {
    butter: () => {
      console.log('butter');
    }
  };
};

// ===========================================

const createPizza = (size, crust, sauce) => {
  return {
    size,
    crust,
    sauce,
    toppings: [],
    ...prepare(),
    ...bake(),
    ...ready()
  };
};

const createSalad = (size, dressing) => {
  return {
    size,
    dressing,
    ...prepare(),
    ...toss(),
    ...ready()
  };
};

const createStuffedButteredCrustPizza = pizza => {
  return {
    ...pizza,
    ...stuff(),
    ...butter()
  };
};

const p2 = createStuffedButteredCrustPizza(
  createPizza('large', 'thin', 'marinara')
);

const addTopping = (pizza, topping) => {
  return {
    ...pizza,
    toppings: [...pizza.toppings, topping]
  };
};

const p3 = addTopping(p2, 'pepperoni');
p3;
