$(document).ready(function() {

 var loggedInUserID =""

  $.get("/api/user_data").then(function(userdata) {

    loggedInUserID=userdata.id
 
    $(".member-name").text(userdata.first);
    $(".welcome").removeClass("d-none")
    $("#home").removeClass("d-none")
    $("#my-articles").removeClass("d-none")
    $("#update-scrape").removeClass("d-none")
    $("#logout").removeClass("d-none")
})

  var getArticles =function() {
    $("#article-full").empty(); 
    $("#article-title").empty(); 
    $("#article-date").empty(); 
    $("#article-like").empty(); 
    $("#article-thumb").empty()
    

    $("#article-results").removeClass("d-none")
    
    $.get("/articles", function(data) {
      // For each one
  
      console.log("Data is " + data)
      for (var i = 0; i < data.length; i++) {

        var thumbImg=$("<img>")
        thumbImg.addClass("article-thumb")
        thumbImg.attr("src", data[i].img)
        thumbImg.attr("data-id", data[i]._id)
        thumbImg.attr("id", "article"+data[i]._id)
  
        $("#article-thumb").append(thumbImg)
      }
  
      var titleH4= $("<h4>")
      titleH4.text(data[0].title)
      $("#article-title").append(titleH4)
  
      if(data[0].subhead !== "") {
        var subheadH5 = $("<h5>")
        subheadH5.text(data[0].subhead)
        $("#article-full").append(subheadH5)
  
      }
  
      var summaryP = $("<p>")
      
      summaryP.text(data[0].summary)
  
      $("#article-full").append(summaryP)
  
      var link=$("<a>")
          link.text("Read More")
          link.attr("href", data[0].link)
          link.attr("target","_blank")
          link.addClass("article-link")
  
          $("#article-full").append(link)
  
      var pubDate= $("<div>")
      pubDate.text("Published " + moment(data[0].published).format("MM/DD/YYYY hh:mm A"))
      pubDate.addClass("float-left")
      $("#article-footer").append(pubDate)
  
      var likeDiv =$("<div>")
      likeDiv.addClass("float-right")
      likeDiv.html('Like This? <i class="like pl-2 far fa-lg fa-thumbs-up" data-id="'+data[0]._id+'"></i>')
      
  
      $("#article-footer").append(likeDiv)

      var commentDiv =$("<div>")
      commentDiv.addClass("float-right")
      commentDiv.html(data[0].comments.length+ ' comments <i class="comment far fa-lg fa-comments mr-3 ml-1" data-id="'+data[0]._id+'"></i>')
      
  
      $("#article-footer").append(commentDiv)


    
  
     


  })

  }

  getArticles()




var updateScrape =function(){
  $.get("/scrape", function(data) {
    $("#message-text").text('Scrape updated!')
    $("#message-modal").modal("show")
    
    setInterval(function(){
      location.reload(true)
    },1000)
    
})
}

$(document).on ("click", "#update-scrape", function (event)  {
  event.preventDefault();
  jQuery.noConflict();
  updateScrape()
 

})

$(document).on ("click", "#home", function (event)  {
  event.preventDefault();
  jQuery.noConflict();
  window.location.href="/home"
 

})

$(document).on ("click", "#logout", function (event)  {
  event.preventDefault();
  jQuery.noConflict();
  window.location.href="/logout"
 

})

$(document).on ("click", ".remove-comment", function (event)  {
  event.preventDefault();
  jQuery.noConflict();
  var commentid = $(this).attr("comment-id")
  var articleid = $(this).attr("article-id")
  console.log("Comment id is " + commentid)
  console.log("Article id is " + articleid)

  $.ajax({
    method: "POST",
    url: "/deletecomment/" + commentid,
    data: {
      // Value taken from title input
      articleid: articleid,
     
    }
  
  })
  .then(function(data) {
    // Log the response
    console.log(data);
    // Empty the notes section
   

    popComments(articleid)
  });
    
  

})

var popComments = function (articleid) {
  $('#article-comments').empty()
  $.get("/articles/" + articleid, function(articledata) {

    console.log("Article comments length is " + articledata.comments.length)
  
    for (i=0; i < articledata.comments.length; i++) {
  
      var commentRow = $('<div>')
      commentRow.addClass("row")
      commentRow.attr("id", "commentRow"+i)
  
      var comment = $("<div>")
      comment.addClass("col-md-8 float-left")
      comment.attr("id", "comment"+ i)
      comment.html("<strong>"+ articledata.comments[i].first+ "</strong>" + " said " + articledata.comments[i].comment)
  
      $('#article-comments').append(commentRow)
      $('#commentRow'+i).append(comment)
  
  
      if( articledata.comments[i].author === loggedInUserID) {
        console.log("Matched " + i)
        
        var deleteComment =$("<div>")
        deleteComment.addClass("col-md-4 float-right remove-comment")
        deleteComment.attr("comment-id", articledata.comments[i]._id)
        deleteComment.attr("article-id", articledata._id)
  
        deleteComment.html('<i class="far fa-minus-square"></i>  Delete')
  
        
       
        $("#commentRow"+i).append(deleteComment)
    
        }
      
    }
  
  })
/*end popComments*/
}

$(document).on ("click", ".comment", function (event)  {
  event.preventDefault();
  jQuery.noConflict();
  var articleid = $(this).attr("data-id")
  $("#submit-comment").attr("data-id", articleid)
  
  $("#comments-modal").modal("show")

popComments(articleid)
 

})

$(document).on ("click", "#submit-comment", function (event)  {
  event.preventDefault();
  jQuery.noConflict();
  var articleid= $(this).attr("data-id")
  var comment=$("#new-comment").val().trim()

  console.log("Id is " + articleid + " and text is " + comment)

  $.ajax({
    method: "POST",
    url: "/comments/" + articleid,
    data: {
      // Value taken from title input
      comment: comment,
     
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#new-comment").val("")

      popComments(articleid)
    });



})


//Thumbnail click//

$(document).on ("click", ".article-thumb", function (event)  {
  event.preventDefault();
  var articleid = $(this).attr("data-id")

  var element = document.getElementById("article" + articleid)
  element.scrollIntoView()
  
  console.log("Id from click is " + articleid)
  $("#article-full").empty(); 
  $("#article-title").empty(); 
  
  $("#article-footer").empty(); 
  

  $.get("/articles/" + articleid, function(articledata) {
    console.log("Article data " + articledata)

    var titleH4= $("<h4>")
    titleH4.text(articledata.title)
    $("#article-title").append(titleH4)

    if(articledata.subhead !== "") {
      var subheadH5 = $("<h5>")
      subheadH5.text(articledata.subhead)
      $("#article-full").append(subheadH5)

    }

    var summaryP = $("<p>")
    
    summaryP.text(articledata.summary)

    $("#article-full").append(summaryP)

    var link=$("<a>")
    link.text("Read More")
    link.attr("href", articledata.link)
    link.attr("target","_blank")
    link.addClass("article-link")

    $("#article-full").append(link)

    var pubDate= $("<div>")
    pubDate.addClass("float-left ")
    pubDate.text("Published " + moment(articledata.published).format("MM/DD/YYYY hh:mm A"))

    $("#article-footer").append(pubDate)

    var likeDiv =$("<div>")
    likeDiv.addClass("float-right")
    likeDiv.html('Like This? <i class="like pl-2 far fa-lg fa-thumbs-up" data-id="'+articledata._id+'"></i>')
    

    $("#article-footer").append(likeDiv)

    var commentDiv =$("<div>")
    commentDiv.addClass("float-right")
    commentDiv.html(articledata.comments.length + ' comments <i class="comment far fa-lg fa-comments mr-3 ml-1" data-id="'+articledata._id+'"></i>')
    

    $("#article-footer").append(commentDiv)

  })


})


//end thumbnail click//

//My articles//

$(document).on ("click", "#my-articles", function (event)  {
  console.log("My articles clicked")
  event.preventDefault();
  jQuery.noConflict();

  $("#article-full").empty(); 
  $("#article-title").empty(); 
  $("#article-footer").empty(); 
  $("#article-thumb").empty()
  
  

  $("#article-results").removeClass("d-none")
  
  $.get("/savedarticles", function(data) {

    console.log("Data is " + data)
    for (var i = 0; i < data.articles.length; i++) {

      var thumbImg=$("<img>")
      thumbImg.addClass("article-thumb")
      thumbImg.attr("src", data.articles[i].img)
      thumbImg.attr("data-id", data.articles[i]._id)
      thumbImg.attr("id", "article"+data.articles[i]._id)

      $("#article-thumb").append(thumbImg)
    }

    var titleH4= $("<h4>")
    titleH4.text(data.articles[0].title)
    $("#article-title").append(titleH4)

    if(data.articles[0].subhead !== "") {
      var subheadH5 = $("<h5>")
      subheadH5.text(data.articles[0].subhead)
      $("#article-full").append(subheadH5)

    }

    var summaryP = $("<p>")
    
    summaryP.text(data.articles[0].summary)

    $("#article-full").append(summaryP)

    var link=$("<a>")
        link.text("Read More")
        link.attr("href", data.articles[0].link)
        link.attr("target","_blank")
        link.addClass("article-link")

        $("#article-full").append(link)

    var pubDate= $("<div>")
    pubDate.addClass("float-left")
    pubDate.text("Published " + moment(data.articles[0].published).format("MM/DD/YYYY hh:mm A"))

    $("#article-footer").append(pubDate)

    var likeDiv =$("<div>")
    likeDiv.addClass("float-right")
    likeDiv.html('Like This? <i class="like pl-2 far fa-lg fa-thumbs-up" data-id="'+data.articles[0]._id+'"></i>')
    

    $("#article-footer").append(likeDiv)

    var commentDiv =$("<div>")
    commentDiv.addClass("float-right")
    commentDiv.html(data.articles[0].comments.length+ ' comments <i class="comment far fa-lg fa-comments mr-3 ml-1" data-id="'+data.articles[0]._id+'"></i>')
    

    $("#article-footer").append(commentDiv)

  })


})

//end my articles//


   


    $(document).on ("click", ".like", function (event)  {
      console.log("Like clicked")
      event.preventDefault();
      jQuery.noConflict();
      
      var likeId = $(this).attr("data-id")
      console.log("Article id is " + likeId)

      $.ajax({
        method: "POST",
        url: "/articles/" + likeId,
        data: {
         _id:likeId
        }
      })
       
        .then(function(data) {
          // Log the response
          console.log(data);
          $("#message-modal").modal("show")
          $("#message-text").text(data)
         
        });
  

    })

    

    $(document).on ("click", "#scraped-articles", function (event)  {
      console.log("My articles clicked")
      event.preventDefault();
      jQuery.noConflict();

      

  

    

  });

})