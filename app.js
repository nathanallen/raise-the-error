angular
  .module("errorGameApp", [])
  .service("ProblemService", ProblemService)
  .controller("GameController", GameController);


GameController.$inject = [ '$interpolate', 'ProblemService' ];
function GameController(    $inteporlate, ProblemService    ){
  var vm = this;
  vm.evaluateGuess = evaluateGuess;
  vm.nextProblem = nextProblem;

  nextProblem();

  ////

  function nextProblem(){
    vm.error = ProblemService.next();
    vm.answered_correctly = false;
  }

  function evaluateGuess(guess){
    vm.answered_correctly = vm.error.isCorrect(guess)
  }
}

// ProblemService.$inject = [];
function ProblemService(){
  var self = this;
  var current_index = -1;

  self.possible_errors = POSSIBLE_ERRORS;
  self.next = next;

  ////

  function next(){
    current_index++;
    return new Problem(self.possible_errors[current_index]);
  }

}

// CONFIGURE UNDERSCORE TO USE DOUBLE CURLIES
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};


function Problem(opts){
  var self = this;
  self.name = opts.name; // name of error
  self.answer = _.sample(opts.variables);
  self.message = _.template("Uncaught {{name}}: " + opts.message_template)(self)
}
Problem.prototype.isCorrect = function(guess){
  var self = this;
  try {
    eval(guess);
  } catch (error) {
    if ( nameMatches(error) && messageMatches(error) ) {
      return true;
    }
  }

  return false;

  ////

  function nameMatches(error){
    return (error.name === self.name);
  }

  function messageMatches(error){
    return self.message.match(error.message).length;
  }
}



var POSSIBLE_ERRORS = [
  {
    name: "ReferenceError",
    message_template: "{{answer}} is not defined",
    variables: ["foo", "bar", "baz"]
  },
  {
    name: "TypeError",
    message_template: "Cannot read property '{{answer}}' of undefined",
    variables: ["foo", "bar", "baz"]
  }
]

