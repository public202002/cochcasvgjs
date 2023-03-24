var element = document.querySelector('#cochca');
setTimeout(function() {
    element.setAttribute('data-text', 'whatever');
  }, 4000)
  setTimeout(function() {
    element.setAttribute('oncochca', 'bubu');
  }, 5000)
  setTimeout(function() {
    var x = $("#cochca")[0]
    console.log("attributes lenght ", x.attributes.length)
    x.setAttribute("oncochca","lala")
  }, 6000)

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === "attributes") {
      console.log("attributes changed ",mutations);

      // Example of accessing the element for which 
      // event was triggered
      mutation.target.textContent = "Attribute of the element changed";
    }else{
        console.log("mutations ". mutations)
    }

    
    console.log(mutation.target);
  });
});

observer.observe(element, {
  attributes: true //configure it to listen to attribute changes
});