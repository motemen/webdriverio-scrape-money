var spawn = require('child_process').spawn;

var chromedriver = spawn('chromedriver', ['--url-base=/wd/hub'], { stdio: 'inherit' });
var command = spawn('node', process.argv.slice(2), { stdio: 'inherit' });
command.on('close', function () {
  chromedriver.kill();
});
