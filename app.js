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
    var next = ProblemService.next();
    vm.problem = next.value;
    vm.is_last_problem = next.done;
    reset();
  }

  function evaluateGuess(guess){
    var confirmation = vm.problem.checkGuess(guess);
    vm.answered_correctly = confirmation.status;
    vm.error_raised = confirmation.error;
  }

  function reset(){
    vm.answered_correctly = false;
    vm.error_raised = "";
    vm.guess = "";
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
    next_problem_data = self.possible_errors[current_index];
    if ( _.isUndefined(next_problem_data) ){ return {done: true}; }
    return {
      value: new Problem(next_problem_data),
      done: _.isUndefined(self.possible_errors[current_index+1])
    };
  }

}

// CONFIGURE UNDERSCORE TO USE DOUBLE CURLIES
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};


function Problem(opts){
  var self = this;
  self.name = opts.name; // name of error
  self.key = _.sample(opts.keys);
  self.full_error_message = _.template("Uncaught {{name}}: " + opts.message_template)(self);
  self.message = _.template(opts.message_template)(self);
}
Problem.prototype.checkGuess = function(guess){
  var self = this;

  try {
    eval(guess);
  } catch (error) {

    var result = {
      error: error.toString()
    }

    if ( nameMatches(error) && messageMatches(error) ) {
      result.status = true;
      return result;
    }

    result.status = false;
    return result;

  }

  return false;

  ////

  function nameMatches(error){
    return (error.name === self.name);
  }

  function messageMatches(error){
    return ( self.message.match(error.message) || [] ).length;
  }
}



var POSSIBLE_ERRORS = [
  {
    name: "ReferenceError",
    message_template: "{{key}} is not defined",
    keys: ["foo", "bar", "baz"]
  },
  {
    name: "TypeError",
    message_template: "Cannot read property '{{key}}' of undefined",
    keys: ["foo", "bar", "baz"]
  }
];
