/**********
 * Config *
 **********/

angular
  .module("errorGameApp", [])
  .service("ProblemService", ProblemService)
  .controller("GameController", GameController)
  .directive("overflowUpward", overflowUpwardDirective)
  .directive("setFocus", setFocus)


/***************
 * Controllers *
 ***************/

GameController.$inject = [ '$interpolate', 'ProblemService' ];
function GameController(    $inteporlate,   ProblemService   ){
  var vm = this;
  vm.evaluateGuess = evaluateGuess;
  vm.nextProblem = nextProblem;
  vm.playAgain = playAgain;
  vm.guess_history = [];
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
    vm.answered_correctly = vm.answered_correctly || confirmation.status;
    vm.guess_history.push({
      guess: guess,
      error_raised: confirmation.error,
      is_correct: confirmation.status
    });
    vm.guess = ""; // clear input
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

/************
 * Services *
 ************/

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


/**********
 * Models *
 **********/

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

  var result = {};

  try {
    eval(guess);
  } catch (error) {

    result.error = error.toString();

    if ( nameMatches(error) && messageMatches(error) ) {
      result.status = true;
      return result;
    }

  }

  result.status = false;
  return result;

  ////

  function nameMatches(error){
    return (error.name === self.name);
  }

  function messageMatches(error){
    return self.message.endsWith(error.message);
  }
}

/**************
 * Directives *
 **************/

function overflowUpwardDirective(){
  return {
    link: function link(scope, element, attrs, controller, transcludeFn){
      var collection = attrs['overflowUpward'];
      scope.$watchCollection(collection, function(){
        var el = element[0];
        el.scrollTop = el.scrollHeight;
      })
    }
  }
}

function setFocus($timeout){
  return {
    link:function(scope, elem, attr){
      var focusTarget = attr['setFocus'];
      // reset focus on elem every time focusTarget's value changes
      scope.$watch(focusTarget, function(){
        $timeout(function(){
          elem[0].focus();
        });
      });
    }
  }
}


/****************
 * Stubbed Data *
 ****************/

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
    keys: ['}'], // evaling as "end of input": ['[', '(', '~', '-', '!', 'function']
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
