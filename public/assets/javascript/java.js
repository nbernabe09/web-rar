// Global Variables

// Functions
$(document).on("click", "#addComment", function(event) {
  event.preventDefault();
  var id = $(this).val();
  var message = $(this).parent().children("div").children("input").val();
  console.log(message);
  
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