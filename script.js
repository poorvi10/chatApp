$(document).ready(function(){

  // Get current user ID
  var userId = 0;

  // Set values
  $('#comment').val('');
  $('#searchText').val('');
  var ascending = false;

  // Invoke events
  $('#searchText').on('keyup', searchChat);
  $('.reply-send').on('click', addMessages);
  $(document).on('click', '.sideBar-body', openWindow);
  $('#comment').keypress(function(e){

    //Enter key pressed
    if(e.which == 13){

      //Trigger search button click event
      $('.reply-send').click();
    }
  });
  $('.heading-sort').on('click', sortChats);

  if (localStorage['data'] === undefined) {

    // Call ajax to get json
    $.ajax({
      url: 'http://demo7999728.mockable.io/users',
      data: {
        format: 'json'
      },
      type: 'GET',
      error: function() {
        console.log("Error Occured");
      },
      success: function(data) {

        // Update message thread window
        updateMessageWindow(data);

        // Render chats on left
        renderLeft(data);

      }
    });
  } else {
    var objJson = JSON.parse(localStorage['data']);

    // Update message thread window
    updateMessageWindow(objJson);
    
    // Render chats on left
    renderLeft(objJson);
  }
  

  // Render chats on left
  function renderLeft(data) {
    $.each( data, function( key, value ) {
      
      // Check for the last message in thread.
      if (value.messages.length != 0) {
        var lastMessage = value.messages[value.messages.length-1].text;
      } else {
        var lastMessage = '';
      }

      var d = new Date();
      var h = addZero(d.getHours());
      var m = addZero(d.getMinutes());
      var time =  h + ":" + m;

      var html = 
                `<div class="row sideBar-body" id="messageThreadId-`+value.id+`">
                    <input id="messageThreadId" value="`+value.id+`" type="hidden">
                  <div class="col-sm-3 col-xs-3 sideBar-avatar">
                    <div class="avatar-icon">
                      <img src="`+value.img+`">
                    </div>
                  </div>
                  <div class="col-sm-9 col-xs-9 sideBar-main">
                    <div class="row">
                      <div class="col-sm-8 col-xs-8 sideBar-name">
                        <span class="name-meta">`+value.user+`</span>
                        <span class="message-meta" id="lastMsg-`+value.id+`">`+lastMessage+`</span>
                      </div>
                      <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
                        <span class="time-meta pull-right">`+time+`</span>
                      </div>
                    </div>
                  </div>
                </div>`;
      $('.sideBar').append(html);
    });
  }

  // Get current hrs and mins
  function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
  }

  // Function to sort chats on the basis of name
  function sortChats() {
    var sortedArray = JSON.parse(localStorage['data']);

    // Check for order
    if (ascending) {
      ascending = false; 
    } else {
      ascending = true; 
    }
    sortOn(sortedArray, "user");
    $('.sideBar').html('');
    renderLeft(sortedArray);

  }

  // Helper function to sort
  function sortOn (arr, prop) {
    arr.sort (
        function (a, b) {
          if (ascending) {
            if (a[prop] < b[prop]) return -1;
            else if (a[prop] > b[prop]) return 1;
            else return 0;
          } else {
            if (a[prop] > b[prop]) return -1;
            else if (a[prop] < b[prop]) return 1;
            else return 0;
          }
        }
    );
  }

  // Adding Message to message thread window.
  function addMessages() {
    var newMessage = $('#comment').val();
    $('#sorryMsg').remove();
    var chatId = $('#chatId').val();
    $('#lastMsg-'+chatId).empty().html(newMessage);

    // Add messages to local storage
    if (newMessage.length != 0) {
      var chatId = $('#chatId').val();

      var updatelocalStorage = JSON.parse(localStorage.data);
      var day = getCurrentDay();

      $.each( updatelocalStorage, function( key, value ) {
        if (value.id === chatId) {
          var load = {  id: userId, 
                        text: newMessage, 
                        created: new Date(), 
                        createdBy: chatId
                      };
          value.messages.push(load);
        }
      });

      // Update local storage
      localStorage.data = JSON.stringify(updatelocalStorage);

      // Check for the sender and receiver
      if (chatId == 0) {
        var build = '<div class="row message-body">'+
                      '<div class="col-sm-12 message-main-receiver">'+
                        '<div class="receiver">'+
                          '<div class="message-text">'+
                            newMessage+
                          '</div>'+
                          '<span class="message-time pull-right">'+
                            day+
                          '</span>'+
                        '</div>'+
                      '</div>'+
                    '</div>';
      } else {
        var build = '<div class="row message-body">'+
                    '<div class="col-sm-12 message-main-sender">'+
                      '<div class="sender">'+
                        '<div class="message-text">'+
                          newMessage+
                        '</div>'+
                        '<span class="message-time pull-right">'+
                          day+
                        '</span>'+
                      '</div>'+
                    '</div>'+
                  '</div>'+
                '</div>';
      }
      $('#conversation').append(build);
      $('#comment').val('');
    }
  }

  // Get current day
  function getCurrentDay() {
    var date = new Date();

    var weekday = new Array(7);
    weekday[0] = "Sun";
    weekday[1] = "Mon";
    weekday[2] = "Tues";
    weekday[3] = "Wed";
    weekday[4] = "Thurs";
    weekday[5] = "Fri";
    weekday[6] = "Sat";
    
    var day = weekday[date.getDay()];
    return day;
  }

  // Update message window 
  function updateMessageWindow(obj) {

    // Check the local storage
    if (localStorage['data'] === undefined) {
      localStorage['data'] = JSON.stringify(obj);
    }

    $('#comment').val('');
    $('#searchText').val('');

    var objJson = JSON.parse(localStorage['data']);

    renderChatMessages(objJson[0]);
  }

  function renderChatMessages(data) {
    $('#chatName').html(data.user);
    var day = getCurrentDay();

    $('#conversation').append('<input value="'+data.id+'" type="hidden" id="chatId">');
    // Render messages
    if (data.messages.length != 0) {
    
      // Loop through each message
      $.each( data.messages, function( key, msgs ) {

        // Check for the sender and receiver
        if (msgs.createdBy == 0) {
          var build = '<div class="row message-body">'+
                        '<div class="col-sm-12 message-main-receiver">'+
                          '<div class="receiver">'+
                            '<div class="message-text">'+
                                msgs.text+
                            '</div>'+
                            '<span class="message-time pull-right">'+
                              day+
                            '</span>'+
                          '</div>'+
                        '</div>'+
                      '</div>';
        } else {
          var build = '<div class="row message-body">'+
                      '<div class="col-sm-12 message-main-sender">'+
                        '<div class="sender">'+
                          '<div class="message-text">'+
                              msgs.text+
                          '</div>'+
                          '<span class="message-time pull-right">'+
                            day+
                          '</span>'+
                        '</div>'+
                      '</div>'+
                    '</div>'+
                  '</div>';
        }
        $('#conversation').append(build);
      });
    } else {
      $('#conversation').append('<span id="sorryMsg">Sorry no messages</span>');
    }
  }


  function openWindow() {
    var chatId = $(this).find('#messageThreadId').val();
    $('#conversation').html('');

    $('#chatName').html($(this).find('.name-meta').text());
    $('.sideBar .sideBar-body').removeClass('activeChat');
    $(this).addClass('activeChat');
      

    var resultObject = search(chatId, JSON.parse(localStorage['data']));
    renderChatMessages(resultObject);
  }

  // Search for the chat with id
  function search(id, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === id) {
            return myArray[i];
        }
    }
  }

  // Search functionality for left sidebar
  function searchChat() {
    var input, chats, a, i;
    input = $('#searchText').val().toUpperCase();

    // Chcek each record to match the value
    $(".sideBar>.sideBar-body").each(function(){
      var term = $(this).children().children().children().children()[0].innerText;
      if (term.toUpperCase().indexOf(input) > -1) {
        $(this).css('display', '');
      } else {
        $(this).css('display', 'none');
      }
    });
  }
});