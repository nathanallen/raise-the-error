angular
  .module("errorGameApp", [])
  .service("ProblemService", ProblemService)
  .controller("GameController", GameController);


GameController.$inject = [ '$interpolate', 'ProblemService' ];
function GameController(    $inteporlate,   ProblemService   ){
  var vm = this;
  vm.evaluateGuess = evaluateGuess;
  vm.nextProblem = nextProblem;
  vm.playAgain = playAgain;

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

  function playAgain(){
    ProblemService.reset();
    vm.is_last_problem = false;
    nextProblem();
  }
}

// ProblemService.$inject = [];
function ProblemService(){
  var self = this;
  self.next = next;
  self.reset = init;

  init();

  ////

  function next(){
    self.current_index++;
    next_problem_data = self.possible_errors[self.current_index];
    if ( _.isUndefined(next_problem_data) ){ return {done: true}; }
    return {
      value: new Problem(next_problem_data),
      done: _.isUndefined(self.possible_errors[self.current_index+1])
    };
  }

  function init(){
    self.current_index = -1;
    self.possible_errors = _.shuffle(POSSIBLE_ERRORS);
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
  self.acceptable_answers = createAnswers();
  self.full_error_message = _.template("Uncaught {{name}}: " + opts.message_template)(self);
  self.message = _.template(opts.message_template)(self);

  ////

  function createAnswers(){
    var result = {};
    var answers = opts.multiple_answers ? opts.keys : [self.key]
    answers.forEach(function(key){
      result[key] = {key: key, guessed: false};
    })
    return result;
  }
}
Problem.prototype.checkGuess = function(guess){
  var self = this;

  var answer = self.acceptable_answers[guess];
  if (answer) {
    answer.guessed = true;
  }

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
    return self.message.endsWith(error.message);
  }
}


// CHROME ONLY
var POSSIBLE_ERRORS = [
  {
    name: "ReferenceError",
    message_template: "{{key}} is not defined",
    keys: ["foo", "bar", "baz"]
    // TODO add accepted_answer: undefined.foo
  },
  {
    name: "TypeError",
    message_template: "Cannot read property '{{key}}' of undefined",
    keys: ["foo", "bar", "baz"]
  },
  {
    name: "SyntaxError",
    message_template: "Unexpected token {{key}}",
    keys: [']', ')', ':', ',', '.', '>', '<', '<=', '>=', '!=', '|', '||', '||=', '&', '&&', '^', '*']
  },
  {
    name: "SyntaxError",
    message_template: "Unexpected token }",
    keys: ['}', '[', '(', '~', '-', 'function'], // buggy: ['!']
    multiple_answers: true
  },
  {
    name: "SyntaxError",
    message_template: "Unexpected end of input",
    keys: ['{', '(', '['],
    multiple_answers: true
  },
  {
    name: "SyntaxError",
    message_template: "Unexpected token ILLEGAL",
    keys: ['#', '@', '\\', ],
    multiple_answers: true
  }
];
