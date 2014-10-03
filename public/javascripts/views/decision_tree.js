//Decision Tree.
define([
  'jquery',
  'underscore',
  'backbone',
  'fancybox',
  '/javascripts/models/answer.js',
  '/javascripts/collections/question_collection.js',
  '/javascripts/views/question.js',
  '/javascripts/views/summary.js',
  '/javascripts/views/describe.js'
], function($, _, Backbone, fancybox, Answer, QuestionCollection, QuestionView, SummaryView, DescribeView) {
  var DecisionTreeView = Backbone.View.extend({
    lastImage: -1,

    selectedImage: -1,

    el: $("#questionnaire"),

    // The DOM events specific to an item.
    events: {
      "click #prev"     : "goBack",
      "click #next"     : "getNextQuestion",
      "click .answer"   : "setAnswer"
    },

    initialize: function() {

      $('.fancybox').fancybox({ 
        'scrolling'     : 'no',
        'overlayOpacity': 0.1,
        'showCloseButton'   : true
      });
      this.collection = new QuestionCollection();
      this.question = new QuestionView();
    },

    render: function() {
      this.loadQuestion(this.collection.first().get("question_id"));
    },

    goBack: function() {
      this.loadQuestion(this.collection.get(this.question.model.cid).get("last_question_id"));
    },

    getNextQuestion: function() {
      var currentQuestion = this.collection.findWhere({"question_id":this.question.model.get("question_id")});
      console.log(currentQuestion.has("answer"));
      console.log(currentQuestion.has("answer").length);
      if (currentQuestion.has("answer") && this.verifyOther(currentQuestion.get("answer")["answer_id"])) {
        var answer = new Answer(currentQuestion.get("answer"));
        //Where should we go?
        if (answer.has("describe")) {
          this.outputDecision(answer);
        } else {
          $("#prev").show();
          var next = answer.get("next");
          var currentQuestionId = this.question.model.get("question_id");
          this.loadQuestion(next);
          this.setLastQuestion(this.question.model, currentQuestionId);
          var inputField = $("#answers").find("input[type=radio]").eq(0).select();
          inputField.focus();
        }
      } else {
        alert("Answer is required.");
      }
    },

    loadQuestion: function(question_id) {
      var nextQuestion = this.collection.findWhere({"question_id":question_id});
      var decisionTree = this;
      decisionTree.question.model = nextQuestion;
      $("#question").html(decisionTree.question.render().el);
      if (question_id == "1") {
        $("#prev").hide();
      }
      decisionTree.question.delegateEvents();
    },

    setLastQuestion: function(currentQuestion, last_question_id) {
      this.collection.get(currentQuestion.cid).set({"last_question_id": last_question_id});
    },

    verifyOther: function(answer_id) {
      return answer_id != $("input[name='answer']").last().val() || ($("#other").length == 0 || $("#other").val() != "");
    },

    outputDecision: function(answer) {
      //Display summary.
      var summary = new SummaryView();
      summary.collection = this.collection;
      $("#summary").html(summary.render().el);  

      //Display recommendation
      var describe = new DescribeView();
      describe.model = answer;
      $("#describe").html(describe.render().el);
      describe.delegateEvents();
      $("#comments").html("<h3>Comments From the Experts:</h3>" + this.selectedImage.get("comments"));
      $("#buttons").hide();
      $("#question").html("");
    },

    setAnswer: function(evt) {
      var answer = $(evt.currentTarget).attr("id");
      this.collection.findWhere({"question_id":this.question.model.get("question_id")}).set({
        "answer": this.question.model.findAnswerById(answer)
      });
    }
  });
  return DecisionTreeView;
});