//import { Box, Element, G, extend, off, on } from './svg.js'
//import  './svg.js'
import * as Box_  from "./types/Box.js"
import { extend } from './utils/adopter.js'
import * as SVGElement_ from "./elements/Element.js"
import {on, off} from "../src/modules/core/event.js"

const Box = Box_.default
const SVGElement = SVGElement_.default

const getCoordsFromEvent = (ev) => {
  if (ev.changedTouches) {
    ev = ev.changedTouches[0]
  }
  return { x: ev.clientX, y: ev.clientY }
}

// Creates handler, saves it
class DragHandler {
  constructor(el) {
    el.remember('_draggable', this)
    this.el = el                                      // e.g. rect

    this.drag = this.drag.bind(this)
    this.startDrag = this.startDrag.bind(this)
    this.endDrag = this.endDrag.bind(this)
  }

  cochcamessage(message){
    if(this.el.cochcamessage){
        this.el.cochcamessage(message)
    }
  }

  // Enables or disabled drag based on input
  init(enabled) {
    if (enabled) {
      this.el.on('mousedown.drag', this.startDrag)
      this.el.on('touchstart.drag', this.startDrag, { passive: false })
    } else {
      this.el.off('mousedown.drag')
      this.el.off('touchstart.drag')
    }
  }

  // Start dragging
  startDrag(ev) {
    const isMouse = !ev.type.indexOf('mouse')

    // Check for left button
    if (isMouse && ev.which !== 1 && ev.buttons !== 0) {
      return
    }

    // Fire beforedrag event
    if (
      this.el.dispatch('beforedrag', { event: ev, handler: this })
        .defaultPrevented
    ) {
      return
    }

    // Prevent browser drag behavior as soon as possible
    ev.preventDefault()

    // Prevent propagation to a parent that might also have dragging enabled
    ev.stopPropagation()

    // Make sure that start events are unbound so that one element
    // is only dragged by one input only
    this.init(false)

    this.box = this.el.bbox()
    this.lastClick = this.el.point(getCoordsFromEvent(ev))

    const eventMove = (isMouse ? 'mousemove' : 'touchmove') + '.drag'
    const eventEnd = (isMouse ? 'mouseup' : 'touchend') + '.drag'

    // Bind drag and end events to window
    on(window, eventMove, this.drag, this, { passive: false })
    on(window, eventEnd, this.endDrag, this, { passive: false })

    // Fire dragstart event
    this.el.fire('dragstart', { event: ev, handler: this, box: this.box })
    this.cochcamessage({type:"startDrag",ev:ev,box:this.box, lastClick:this.lastClick})

  }

  // While dragging
  drag(ev) {
    const { box, lastClick } = this

    const currentClick = this.el.point(getCoordsFromEvent(ev))
    const dx = currentClick.x - lastClick.x
    const dy = currentClick.y - lastClick.y

    if (!dx && !dy) return box

    const x = box.x + dx
    const y = box.y + dy
    this.box = new Box(x, y, box.w, box.h)
    this.lastClick = currentClick
    

    if (
      this.el.dispatch('dragmove', {
        event: ev,
        handler: this,
        box: this.box,
      }).defaultPrevented
    ) {
      return
    }

    this.move(x, y)
    this.cochcamessage({type:"drag",ev:ev,box:this.box, lastClick:this.lastClick})

  }

  move(x, y) {
    // Svg elements bbox depends on their content even though they have
    // x, y, width and height - strange!
    // Thats why we handle them the same as groups
    if (this.el.type === 'svg') {
      G.prototype.move.call(this.el, x, y)
    } else {
      this.el.move(x, y)
    }
    this.cochcamessage({type:"move",x:x, y:y})

  }

  endDrag(ev) {
    // final drag
    this.drag(ev)

    // fire dragend event
    this.el.fire('dragend', { event: ev, handler: this, box: this.box })

    // unbind events
    off(window, 'mousemove.drag')
    off(window, 'touchmove.drag')
    off(window, 'mouseup.drag')
    off(window, 'touchend.drag')

    // Rebind initial Events
    this.init(true)    
    this.cochcamessage({type:"endDrag",ev:ev,box:this.box})

  }
}

extend(SVGElement, {
  draggable(enable = true) {
    const dragHandler = this.remember('_draggable') || new DragHandler(this)
    dragHandler.init(enable)
    return this
  },
})