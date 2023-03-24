import SVG from "./svg.js/src/svg.js"
import "./svg.js/src/svg.draggable.js"

SVG.on(document, 'DOMContentLoaded', function() {
    var draw = SVG().addTo('body').size(400, 400)
    draw.addClass("border")
    //console.log($(draw).css({border:"1px"}))
    var rect = draw.rect(30,30)
    rect.animate().fill('#f03').move(100,100)
    var x = (rect === rect.draggable()) // true
    rect.draggable().on('beforedrag', e => {
        //e.preventDefault()
        // no other events are bound
        // drag was completely prevented
      })

rect.cochcamessage = function(message){
    console.log(message)
}

  })
