
 function create_user(){
    var username = $("#uname").val();
    var password = $("#password").val();
    console.log("creating user in index.js");
      $.ajax({
        url: `/user/${username}/${password}`,
        type: 'PUT',
        success: function(result) {
            console.log(result);
           $('#message').html(result);
          }
        });
 };




