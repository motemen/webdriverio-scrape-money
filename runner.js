var spawn = require('child_process').spawn,
    exec  = require('child_process').exec;

var chromedriver = spawn('chromedriver', ['--url-base=/wd/hub'], { stdio: 'inherit' });
var command = spawn('node', process.argv.slice(2), { stdio: 'inherit' });
command.on('close', function () {
  chromedriver.kill();
});
