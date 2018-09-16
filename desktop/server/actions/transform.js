"use strict";

function Transform(host)
{
  require(`../action`).call(this,host,"transform");

  this.docs = "Change your current vessel name."

  this.operate = function(params)
  {
    let parts = this.remove_articles(params).split(" ")
    let name = parts[parts.length-1].toLowerCase()
    let target = parts.length > 2 ? this.find(parts[0],this.host.siblings()) : this.host
    let origin = target.data.name

    if(params.trim() == ""){ return `<p>Huh?! For more details on how to transform, type <action data='help with transform'>help</action>.</p>`; }
    if(name == ""){ return `<p>Huh?! For more details on how to transform, type <action data='help with transform'>help</action>.</p>`; }

    target.set("name",name)
    return `<p>You transformed the ${target.id != this.host.id ? origin : ''} into a <action>${name}</action>.</p>`
  }
}

module.exports = Transform