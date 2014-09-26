var webdriverio = require('webdriverio'),
    async       = require('async'),
    fs          = require('fs');

var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

var outFilePath = [
  'mufg-', lastMonth.getFullYear(), '-', (lastMonth.getMonth() + 101).toString().substr(-2), '.tsv'
].join('');

var options = {
  host: 'localhost',
  port: 9515,
  desiredCapabilities: {
    browserName: 'chrome',
    chromeOptions: {
      'excludeSwitches': ['ignore-certificate-errors']
    }
  }
};

var WAIT = 5 * 1000;

var client = webdriverio.remote(options).init();

client
  .url('https://entry11.bk.mufg.jp/ibg/dfw/APLIN/loginib/login?_TRANID=AA000_001')
  .addValue('[name="KEIYAKU_NO"]', process.env.MUFG_ID)
  .addValue('[name="PASSWORD"]',   process.env.MUFG_PASSWORD)
  .click('[alt="ログイン"]')

  .waitFor('#setAmountDisplay', WAIT)
  .getText('#setAmountDisplay', function (err, res) {
    console.log('残高: ' + res);
  })
  .click('[alt="入出金明細をみる"]')

  .waitFor('input#last_month', WAIT)
  .click('input#last_month')
  .click('[alt="照会"]')

  .waitFor('#no_memo table tr', WAIT)
  .elements('#no_memo table tr', function (err, rows) {
    async.map(rows.value, function (row, cb) {
      client.elementIdElements(row.ELEMENT, 'td', function (err, cols) {
        async.map(cols.value, function (td, cb) {
          client.elementIdText(td.ELEMENT, cb);
        }, cb);
      });
    }, function (err, rows) {
      var content = rows.filter(function (cols) {
        return cols.length === 5;
      }).map(function (cols) {
        return cols.map(function (td) { return td.value.replace(/\s+/g, ' ') }).join('\t');
      }).join('\n');

      fs.writeFileSync(outFilePath, content);
      console.log('wrote: ' + outFilePath);
    });
  })

  .end();
