// Global Variables

// Functions
$(document).on("click", "#addComment", function(event) {
  event.preventDefault();
  var id = $(this).val();
  var message = $(this).parent().children("div").children("input").val();
  
  $.ajax({
    method: "POST",
    url: "/comment/" + id,
    data: {
      message: message
    },
    success: function() {
      $(document).ajaxStop(function() {
        location.reload(true);
      });
    }
  });
});

$(document).on("click", "#deleteComment", function(event) {
  event.preventDefault();
  var id = $(this).attr("value");
  
  $.ajax({
    method: "DELETE",
    url: "/delete/",
    data: {
      id: id
    },
    success: function() {
      $(document).ajaxStop(function() {
        location.reload(true);
      });
    }
  });
});