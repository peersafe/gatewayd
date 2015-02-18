function bind(action, filename){
  module.exports[action] = require(__dirname+'/'+filename);
}

bind('rippleTxt', 'build_ripple_txt.js');
bind('webapp', 'webapp.js');
