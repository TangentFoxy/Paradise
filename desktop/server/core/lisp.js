function Lisp(input)
{
  this.input = input;

  const library = {
    first: function(x) {
      return x[0];
    },
    add: function(x){
      return x[0]+x[1];
    },
    rest: function(x) {
      return x.slice(1);
    },
    print: function(x) {
      console.log(x);
      return x;
    }
  };

  const Context = function(scope, parent) 
  {
    this.scope = scope;
    this.parent = parent;

    this.get = function(identifier)
    {
      if(identifier in this.scope) {
        return this.scope[identifier];
      } 
      else if (this.parent !== undefined){
        return this.parent.get(identifier);
      }
    };
  };

  const special = {
    let: function(input, context)
    {
      const letContext = input[1].reduce(function(acc, x) 
      {
        acc.scope[x[0].value] = interpret(x[1], context);
        return acc;
      }, new Context({}, context));

      return interpret(input[2], letContext);
    },

    lambda: function(input, context) 
    {
      return function()
      {
        const lambdaArguments = arguments;
        const lambdaScope = input[1].reduce(function(acc, x, i) 
        {
          acc[x.value] = lambdaArguments[i];
          return acc;
        }, {});

        return interpret(input[2], new Context(lambdaScope, context));
      };
    },

    if: function(input, context)
    {
      return interpret(input[1], context) ? interpret(input[2], context) : interpret(input[3], context);
    }
  };

  const interpretList = function(input, context)
  {
    if (input.length > 0 && input[0].value in special){
      return special[input[0].value](input, context);
    } 
    else {
      const list = input.map(function(x) { return interpret(x, context); });
      return list[0] instanceof Function ? list[0].apply(undefined, list.slice(1)) : list;
    }
  };

  const interpret = function(input, context)
  {
    if(context === undefined){
      return interpret(input, new Context(library));
    } 
    else if(input instanceof Array){
      return interpretList(input, context);
    } 
    else if(input.type === "identifier"){
      return context.get(input.value);
    } 
    else if(input.type === "number" || input.type === "string"){
      return input.value;
    }
  };

  const categorize = function(input)
  {
    if(!isNaN(parseFloat(input))){
      return { type:'number', value: parseFloat(input) };
    } 
    else if (input[0] === '"' && input.slice(-1) === '"'){
      return { type:'string', value: input.slice(1, -1) };
    } 
    else{
      return { type:'identifier', value: input };
    }
  };

  const parenthesize = function(input, list)
  {
    if(list === undefined){
      return parenthesize(input, []);
    } 
    else {
      const token = input.shift();

      if(token === undefined){
        return list.pop();
      } 
      else if(token === "("){
        list.push(parenthesize(input, []));
        return parenthesize(input, list);
      } 
      else if(token === ")"){
        return list;
      } 
      else {
        return parenthesize(input, list.concat(categorize(token)));
      }
    }
  };

  const tokenize = function(input)
  {
    return input.split('"').map(function(x, i){ return i % 2 === 0 ? x.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ') : x.replace(/ /g, "!whitespace!"); }).join('"').trim().split(/\s+/).map(function(x){ return x.replace(/!whitespace!/g, " "); });
  };

  this.parse = function(input)
  {
    return parenthesize(tokenize(input));
  }

  this.toString = function()
  {
    return interpret(this.parse(this.input));
  }
}

module.exports = Lisp