angular
  .module("errorGameApp", [])
  .service("ProblemService", ProblemService)
  .controller("GameController", GameController);


GameController.$inject = [ '$interpolate', 'ProblemService' ];
function GameController(    $inteporlate, ProblemService    ){
  var vm = this;

  var error = ProblemService.next();
  vm.error_message = $inteporlate(error.template)({name: error.answer});
  vm.evaluateGuess = evaluateGuess;
  vm.answered_correctly = false;

  ////

  function evaluateGuess(guess){
    if (guess === error.answer){
      vm.answered_correctly = true;
      return true;
    }
    return false;
  }
}

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

function Problem(opts){
  var self = this;
  self.type = opts.type;
  self.answer = _.sample(opts.names);
  self.template = opts.template;
}


var POSSIBLE_ERRORS = [
  {
    type: "ReferenceError",
    template: "Uncaught ReferenceError: {{name}} is not defined",
    names: ["foo", "bar", "baz"]
  }
]

