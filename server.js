/*globals __dirname*/
require('http').createServer(require('stack/stack')(
	require('middleware/log')(),
  require('middleware/auth')(/\//, {'joshholt':'8j0GqIitKNzP7Ve9MenjPSx2GVI='}),
  require('middleware/listing')("/f/", __dirname+"/public/media/Music"),
  require('middleware/static')('/', __dirname + "/public", "index.html")
)).listen(8080);
console.log("Your media is available @ http://0.0.0.0:"+ 8080);